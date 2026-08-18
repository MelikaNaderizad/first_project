import sys
import time
import logging
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from extract.extract_product import extract_products
from transform.clean_product import transform_product
from load.load_product import load_products, build_seen_from_db
from config import PRODUCTS_CSV
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

Base.metadata.create_all(engine)

CHUNK_SIZE = 10_000
session = SessionLocal()

logger.info("checking resume safe")
t0 = time.time()
seen = build_seen_from_db(session)
logger.info(f"{len(seen)} رکورد در {time.time() - t0:.1f} ثانیه بارگذاری شد.")

total = 0
chunk_num = 0

try:
    logger.info("Starting")
    for chunk in extract_products(PRODUCTS_CSV, chunksize=CHUNK_SIZE):
        chunk_num += 1
        t_chunk = time.time()
        cleaned = transform_product(chunk)
        t_clean = time.time()
        load_products(cleaned, session, seen)
        t_load = time.time()
        total += len(cleaned)
        logger.info(
            f"چانک {chunk_num} | {len(cleaned)} ردیف | "
            f"clean: {t_clean - t_chunk:.2f}s | load: {t_load - t_clean:.2f}s | "
            f"جمع کل: {total} رکورد"
        )
except Exception:
    logger.exception("Err")
    raise
finally:
    session.close()

logger.info(f"Done! total: {total}")