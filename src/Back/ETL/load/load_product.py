import sys
import time
import logging
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

import pandas as pd
from sqlalchemy import insert
from sqlalchemy.exc import SQLAlchemyError

from database.models import Products
from database.conn import engine

logger = logging.getLogger(__name__)


def _clean_value(v):
    if pd.isna(v):
        return None
    return v


def _clean_record(record: dict) -> dict:
    return {k: _clean_value(v) for k, v in record.items()}


def _null_count(record: dict) -> int:
    return sum(1 for v in record.values() if v is None or v == "")


def build_seen_from_db(session) -> dict:
    seen = {}
    cols = [
        Products.id, Products.title_fa, Products.rate, Products.rate_cnt,
        Products.category1, Products.category2, Products.brand, Products.price,
        Products.seller, Products.is_fake, Products.min_price_last_month,
        Products.sub_category,
    ]
    col_names = [c.key for c in cols]
    for row in session.query(*cols).yield_per(5000):
        record = dict(zip(col_names, row))
        null_count = _null_count(record)
        seen[record["id"]] = (null_count, "committed", None)
    return seen


def _insert_batch(records):
    conn = engine.connect()
    try:
        with conn.begin():
            conn.execute(insert(Products), records)
    except SQLAlchemyError:
        conn.invalidate()
        raise
    finally:
        conn.close()


def _safe_bulk_insert(records, batch_size=500):
    inserted = 0
    failed_ids = set()

    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            _insert_batch(batch)
            inserted += len(batch)
        except SQLAlchemyError:
            for r in batch:
                try:
                    _insert_batch([r])
                    inserted += 1
                except SQLAlchemyError as e:
                    failed_ids.add(r.get("id"))
                    logger.warning(
                        f"رکورد رد شد (id={r.get('id')}): "
                        f"{e.__class__.__name__}: {e}"
                    )

    return inserted, failed_ids


def load_products(df: pd.DataFrame, session, seen: dict):
    t0 = time.time()
    records = [_clean_record(r) for r in df.to_dict("records")]
    t_clean_records = time.time()

    to_insert = []
    to_update = {}
    for record in records:
        rid = record["id"]
        null_count = _null_count(record)
        if rid not in seen:
            idx = len(to_insert)
            to_insert.append(record)
            seen[rid] = (null_count, "pending", idx)
            continue
        existing_null, status, ref = seen[rid]
        if null_count < existing_null:
            if status == "pending":
                to_insert[ref] = record
                seen[rid] = (null_count, "pending", ref)
            else:
                to_update[rid] = record
                seen[rid] = (null_count, "committed", None)
    t_loop = time.time()

    inserted_count, failed_ids = _safe_bulk_insert(to_insert)
    t_insert = time.time()

    if to_update:
        session.bulk_update_mappings(Products, list(to_update.values()))
    t_update = time.time()

    session.commit()
    t_commit = time.time()

    for record in to_insert:
        rid = record["id"]

        if rid in failed_ids:
            seen.pop(rid, None)
            continue

        null_count, status, ref = seen[rid]
        if status == "pending":
            seen[rid] = (null_count, "committed", None)

    logger.info(
        f"  -> to_dict/clean: {t_clean_records - t0:.2f}s | "
        f"loop({len(records)}): {t_loop - t_clean_records:.2f}s | "
        f"insert({inserted_count} ok, {len(failed_ids)} failed): "
        f"{t_insert - t_loop:.2f}s | "
        f"update({len(to_update)}): {t_update - t_insert:.2f}s | "
        f"commit: {t_commit - t_update:.2f}s"
    )
    return {
    "inserted": inserted_count,
    "updated": len(to_update),
    "failed": len(failed_ids),
}