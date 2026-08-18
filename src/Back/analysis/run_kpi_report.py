import sys
import re
import time
import logging
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import pandas as pd
from database.conn import engine

LOG_FILE = Path(__file__).resolve().parent / "kpi_run.log"
SQL_FILE = Path(__file__).resolve().parent/"queries" / "kpi_queries.sql"
REPORTS_DIR = Path(__file__).resolve().parent / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


def parse_kpi_blocks(sql_text: str):
    raw_statements = sql_text.split(";")

    blocks = []
    for i, raw in enumerate(raw_statements, start=1):
        lines = [
            line for line in raw.splitlines()
            if not line.strip().startswith("--") and line.strip() != ""
        ]
        query = "\n".join(lines).strip()
        if query:
            blocks.append((f"{i:02d}", query))

    return blocks


def run_kpis():
    sql_text = SQL_FILE.read_text(encoding="utf-8")
    blocks = parse_kpi_blocks(sql_text)
    logger.info(f"{len(blocks)} تا کوئری KPI پیدا شد.")

    with engine.connect() as connection:
        for kpi_id, query in blocks:
            start = time.time()
            try:
                df = pd.read_sql(query, connection)
                elapsed = time.time() - start

                out_path = REPORTS_DIR / f"kpi_{kpi_id}.csv"
                df.to_csv(out_path, index=False, encoding="utf-8-sig")

                logger.info(
                    f"KPI {kpi_id} | {len(df)} ردیف | {elapsed:.2f}s | "
                    f"ذخیره شد در {out_path.name}"
                )
            except Exception:
                logger.exception(f"خطا در اجرای KPI {kpi_id}")

    logger.info("finish")


if __name__ == "__main__":
    run_kpis()