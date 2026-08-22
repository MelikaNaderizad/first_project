import sys
import time
import logging
from pathlib import Path

sys.path.append(
    str(Path(__file__).resolve().parent.parent)
)

from extract.extract_product import extract_products
from transform.clean_product import clean_chunk
from load.load_product import load_products, build_seen_from_db
from config import PRODUCTS_CSV
from database.conn import engine, SessionLocal
from database.models import Base


LOG_FILE = Path(__file__).resolve().parent / "etl_products.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)

logger = logging.getLogger(__name__)

Base.metadata.create_all(engine)

CHUNK_SIZE = 10_000
session = SessionLocal()

logger.info(
    "در حال بارگذاری رکوردهای موجود Products از دیتابیس..."
)

t0 = time.time()

seen = build_seen_from_db(session)

logger.info(
    f"{len(seen)} رکورد موجود در دیتابیس "
    f"در {time.time() - t0:.1f} ثانیه بارگذاری شد."
)

totals = {
    "input_rows": 0,
    "dropped_missing_id_or_title": 0,
    "invalid_rate": 0,
    "invalid_rate_cnt": 0,
    "invalid_price": 0,
    "invalid_min_price_last_month": 0,
    "output_rows": 0,
    "inserted": 0,
    "updated": 0,
    "failed": 0,
}

chunk_num = 0

try:
    logger.info("شروع پردازش Products...")

    for chunk in extract_products(
        PRODUCTS_CSV,
        chunksize=CHUNK_SIZE
    ):
        chunk_num += 1

        t_chunk = time.time()

        cleaned, clean_stats = clean_chunk(chunk)

        t_clean = time.time()

        load_stats = load_products(
            cleaned,
            session,
            seen
        )

        t_load = time.time()

        for key in (
            "input_rows",
            "dropped_missing_id_or_title",
            "invalid_rate",
            "invalid_rate_cnt",
            "invalid_price",
            "invalid_min_price_last_month",
            "output_rows",
        ):
            totals[key] += clean_stats[key]

        for key in (
            "inserted",
            "updated",
            "failed",
        ):
            totals[key] += load_stats[key]

        logger.info(
            f"چانک {chunk_num} | "
            f"input: {clean_stats['input_rows']} | "
            f"dropped: {clean_stats['dropped_missing_id_or_title']} | "
            f"invalid_rate: {clean_stats['invalid_rate']} | "
            f"invalid_rate_cnt: {clean_stats['invalid_rate_cnt']} | "
            f"invalid_price: {clean_stats['invalid_price']} | "
            f"invalid_min_price: {clean_stats['invalid_min_price_last_month']} | "
            f"output: {clean_stats['output_rows']} | "
            f"inserted: {load_stats['inserted']} | "
            f"updated: {load_stats['updated']} | "
            f"failed: {load_stats['failed']} | "
            f"clean: {t_clean - t_chunk:.2f}s | "
            f"load: {t_load - t_clean:.2f}s"
        )

except Exception:
    logger.exception("خطا در حین پردازش Products")
    raise

finally:
    session.close()

logger.info("=" * 60)
logger.info("گزارش نهایی وضعیت پردازش Products")
logger.info("=" * 60)

logger.info(
    f"کل رکوردهای خام خوانده‌شده: "
    f"{totals['input_rows']}"
)

logger.info(
    f"حذف‌شده به دلیل id یا title_fa خالی: "
    f"{totals['dropped_missing_id_or_title']}"
)

logger.info(
    f"rate نامعتبر: "
    f"{totals['invalid_rate']}"
)

logger.info(
    f"rate_cnt نامعتبر: "
    f"{totals['invalid_rate_cnt']}"
)

logger.info(
    f"price نامعتبر: "
    f"{totals['invalid_price']}"
)

logger.info(
    f"min_price_last_month نامعتبر: "
    f"{totals['invalid_min_price_last_month']}"
)

logger.info(
    f"رکوردهای باقی‌مانده بعد از Cleaning: "
    f"{totals['output_rows']}"
)

logger.info(
    f"رکوردهای Insert شده: "
    f"{totals['inserted']}"
)

logger.info(
    f"رکوردهای Update شده: "
    f"{totals['updated']}"
)

logger.info(
    f"رکوردهای ناموفق در Insert: "
    f"{totals['failed']}"
)

logger.info("=" * 60)
logger.info("پردازش Products به پایان رسید.")