import sys
import time
import logging
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from extract.extract_comment import extract_comments
from transform.clean_comment import clean_chunk
from load.load_comment import load_comments, build_seen_from_db
from config import COMMENTS_CSV
from database.conn import engine, SessionLocal
from database.models import Base

LOG_FILE = Path(__file__).resolve().parent / "etl.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
    ],
)

logger = logging.getLogger(__name__)
logger.info("starting")

Base.metadata.create_all(engine)

CHUNK_SIZE = 10_000
session = SessionLocal()

logger.info("being resume safe")

t0 = time.time()
seen = build_seen_from_db(session)

logger.info(
    f"{len(seen)} رکورد در "
    f"{time.time() - t0:.1f} ثانیه بارگذاری شد."
)

total = 0
chunk_num = 0

try:
    logger.info("starting")

    for chunk in extract_comments(
        COMMENTS_CSV,
        chunksize=CHUNK_SIZE
    ):
        chunk_num += 1
        t_chunk = time.time()

        chunk, stats = clean_chunk(chunk)

        t_clean = time.time()

        load_comments(
            chunk,
            session,
            seen
        )

        t_load = time.time()

        total += len(chunk)

        logger.info(
            f"چانک {chunk_num} | "
            f"input: {stats['input_rows']} | "
            f"dropped: {stats['dropped_missing_id_or_body']} | "
            f"invalid_rate: {stats['invalid_rate']} | "
            f"invalid_ttsr: {stats['invalid_true_to_size_rate']} | "
            f"invalid_likes: {stats['invalid_likes']} | "
            f"invalid_dislikes: {stats['invalid_dislikes']} | "
            f"output: {stats['output_rows']} | "
            f"clean: {t_clean - t_chunk:.2f}s | "
            f"load: {t_load - t_clean:.2f}s | "
            f"جمع کل: {total}"
        )

except Exception:
    logger.exception("خطا در حین پردازش")
    raise

finally:
    session.close()

logger.info(
    f"پردازش تمام شد. "
    f"مجموع رکوردهای بررسی‌شده: {total}"
)