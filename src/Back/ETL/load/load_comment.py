import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

import math
import time
import logging
import pandas as pd

from database.models import Comments

logger = logging.getLogger(__name__)

PERSIAN_MONTHS = {
    "فروردین": 1,
    "اردیبهشت": 2,
    "خرداد": 3,
    "تیر": 4,
    "مرداد": 5,
    "شهریور": 6,
    "مهر": 7,
    "آبان": 8,
    "آذر": 9,
    "دی": 10,
    "بهمن": 11,
    "اسفند": 12,
}


def parse_persian_date(date_str):
    try:
        day, month_name, year = str(date_str).split()
        month = PERSIAN_MONTHS[month_name]
        return int(year) * 10000 + month * 100 + int(day)
    except (ValueError, KeyError):
        return 0


def _clean_value(v):
    if isinstance(v, float) and math.isnan(v):
        return None
    return v


def _clean_record(record: dict) -> dict:
    return {k: _clean_value(v) for k, v in record.items()}


def _null_count(record: dict) -> int:
    return sum(
        1
        for v in record.values()
        if v is None or v == ""
    )


def build_seen_from_db(session) -> dict:
    seen = {}

    cols = [
        Comments.id,
        Comments.title,
        Comments.body,
        Comments.created_at,
        Comments.rate,
        Comments.recommendation_status,
        Comments.is_buyer,
        Comments.product_id,
        Comments.advantages,
        Comments.disadvantages,
        Comments.likes,
        Comments.dislikes,
        Comments.seller_title,
        Comments.seller_code,
        Comments.true_to_size_rate,
    ]

    col_names = [c.key for c in cols]

    for row in session.query(*cols).yield_per(5000):
        record = dict(zip(col_names, row))
        null_count = _null_count(record)
        date_key = parse_persian_date(record.get("created_at"))

        seen[record["id"]] = (
            null_count,
            date_key,
            "committed",
            None,
        )

    return seen


def load_comments(
    df: pd.DataFrame,
    session,
    seen: dict
):
    t0 = time.time()

    records = [
        _clean_record(r)
        for r in df.to_dict("records")
    ]

    t_clean_records = time.time()

    to_insert = []
    to_update = {}
    duplicate_discarded = 0

    for record in records:
        rid = record["id"]

        null_count = _null_count(record)
        date_key = parse_persian_date(
            record.get("created_at")
        )

        new_key = (
            null_count,
            -date_key,
        )

        if rid not in seen:
            idx = len(to_insert)

            to_insert.append(record)

            seen[rid] = (
                null_count,
                date_key,
                "pending",
                idx,
            )

            continue

        existing_null, existing_date, status, ref = seen[rid]

        existing_key = (
            existing_null,
            -existing_date,
        )

        if new_key < existing_key:
            if status == "pending":
                to_insert[ref] = record

                seen[rid] = (
                    null_count,
                    date_key,
                    "pending",
                    ref,
                )
            else:
                to_update[rid] = record

                seen[rid] = (
                    null_count,
                    date_key,
                    "committed",
                    None,
                )
        else:
            duplicate_discarded += 1

    t_loop = time.time()

    if to_insert:
        session.bulk_insert_mappings(
            Comments,
            to_insert,
            render_nulls=True,
        )

    t_insert = time.time()

    if to_update:
        session.bulk_update_mappings(
            Comments,
            list(to_update.values()),
        )

    t_update = time.time()

    session.commit()

    t_commit = time.time()

    for record in to_insert:
        rid = record["id"]

        null_count, date_key, status, ref = seen[rid]

        if status == "pending":
            seen[rid] = (
                null_count,
                date_key,
                "committed",
                None,
            )

    logger.info(
        f"  -> to_dict/clean: {t_clean_records - t0:.2f}s | "
        f"loop({len(records)}): {t_loop - t_clean_records:.2f}s | "
        f"insert({len(to_insert)}): {t_insert - t_loop:.2f}s | "
        f"update({len(to_update)}): {t_update - t_insert:.2f}s | "
        f"duplicates({duplicate_discarded}): "
        f"{t_commit - t_update:.2f}s | "
        f"commit: {t_commit - t_update:.2f}s"
    )