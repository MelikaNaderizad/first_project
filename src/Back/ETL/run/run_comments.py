import sys
import time
import logging
from pathlib import Path

sys.path.append(
    str(Path(__file__).resolve().parent.parent)
)

from extract.extract_comment import extract_comments
from transform.clean_comment import clean_chunk
from load.load_comment import (
    load_comments,
    build_seen_from_db,
)
from config import COMMENTS_CSV
from database.conn import (
    engine,
    SessionLocal,
    Base,
)
from database.models import Comments, Products
from sqlalchemy import func


LOG_FILE = (
    Path(__file__).resolve().parent
    / "etl_comments.log"
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(
            LOG_FILE,
            encoding="utf-8"
        ),
        logging.StreamHandler(sys.stdout),
    ],
)

logger = logging.getLogger(__name__)


# build tables
Base.metadata.create_all(engine)


CHUNK_SIZE = 10_000

session = SessionLocal()


logger.info(
    "در حال بارگذاری رکوردهای موجود از دیتابیس..."
)

t0 = time.time()

seen = build_seen_from_db(session)

logger.info(
    f"{len(seen)} رکورد در "
    f"{time.time() - t0:.1f} ثانیه بارگذاری شد."
)


totals = {
    "input_rows": 0,
    "dropped_missing_id_or_body": 0,

    "invalid_rate": 0,
    "invalid_true_to_size_rate": 0,
    "invalid_likes": 0,
    "invalid_dislikes": 0,

    "output_rows": 0,

    "inserted": 0,
    "updated": 0,
    "duplicate_discarded": 0,
}


chunk_num = 0


try:

    for chunk in extract_comments(
        COMMENTS_CSV,
        chunksize=CHUNK_SIZE
    ):

        chunk_num += 1

        cleaned, clean_stats = clean_chunk(
            chunk
        )

        load_stats = load_comments(
            cleaned,
            session,
            seen
        )

        clean_keys = [
            "input_rows",
            "dropped_missing_id_or_body",
            "invalid_rate",
            "invalid_true_to_size_rate",
            "invalid_likes",
            "invalid_dislikes",
            "output_rows",
        ]

        for key in clean_keys:
            totals[key] += clean_stats[key]


        load_keys = [
            "inserted",
            "updated",
            "duplicate_discarded",
        ]

        for key in load_keys:
            totals[key] += load_stats[key]


        if chunk_num % 20 == 0:

            logger.info(
                f"چانک {chunk_num} | "
                f"جمع کل ورودی: "
                f"{totals['input_rows']} | "
                f"Insert: {totals['inserted']} | "
                f"Update: {totals['updated']} | "
                f"Duplicate: "
                f"{totals['duplicate_discarded']}"
            )


except Exception:

    logger.exception(
        "خطا در اجرای ETL"
    )

    raise


finally:

    session.close()


# report

logger.info("=" * 50)

logger.info(
    "گزارش نهایی وضعیت پردازش"
)

logger.info("=" * 50)

logger.info(
    f"کل رکوردهای خام خوانده‌شده: "
    f"{totals['input_rows']}"
)

logger.info(
    f"حذف‌شده (id یا body خالی): "
    f"{totals['dropped_missing_id_or_body']}"
)

logger.info(
    f"rate نامعتبر: "
    f"{totals['invalid_rate']}"
)

logger.info(
    f"true_to_size_rate نامعتبر: "
    f"{totals['invalid_true_to_size_rate']}"
)

logger.info(
    f"likes نامعتبر: "
    f"{totals['invalid_likes']}"
)

logger.info(
    f"dislikes نامعتبر: "
    f"{totals['invalid_dislikes']}"
)

logger.info(
    f"دوپلیکیت نادیده‌گرفته‌شده: "
    f"{totals['duplicate_discarded']}"
)

logger.info(
    f"رکورد Insert شده: "
    f"{totals['inserted']}"
)

logger.info(
    f"رکورد Update شده: "
    f"{totals['updated']}"
)