import logging
import sys

from sqlalchemy import select, func, cast, Integer
from sqlalchemy.dialects.postgresql import insert

from database.conn import engine, SessionLocal, Base
from database.models import ProductComments, ProductForecasts

from .config import YEAR_FROM, YEAR_TO
from .service import forecast_product

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

TOP_N = int(sys.argv[1]) if len(sys.argv) > 1 else 200


def candidate_products(session, top_n):
    year = cast(func.split_part(ProductComments.created_at, " ", 3), Integer)
    stmt = (
        select(ProductComments.product_id, func.count().label("cnt"))
        .where(year.between(YEAR_FROM, YEAR_TO))
        .group_by(ProductComments.product_id)
        .order_by(func.count().desc())
        .limit(top_n)
    )
    return session.execute(stmt).all()


def main():
    Base.metadata.create_all(engine)

    with SessionLocal() as session:
        candidates = candidate_products(session, TOP_N)
        logger.info("%d کاندید", len(candidates))

        done = skipped = failed = 0
        for pid, cnt in candidates:
            try:
                result = forecast_product(pid)
            except Exception:
                logger.exception("خطا برای محصول %s", pid)
                failed += 1
                continue

            if result is None:          # کمتر از MIN_MONTHS
                skipped += 1
                continue

            row = {
                "product_id": pid,
                "total_comments": cnt,
                "mae": result["metrics"]["mae"],
                "baseline_mae": result["metrics"]["baseline_mean_mae"],
                "payload": result,
            }
            stmt = insert(ProductForecasts).values(**row)
            stmt = stmt.on_conflict_do_update(
                index_elements=["product_id"],
                set_={k: v for k, v in row.items() if k != "product_id"}
                     | {"computed_at": func.now()},
            )
            session.execute(stmt)
            session.commit()
            done += 1
            logger.info("محصول %s ذخیره شد (%d/%d)", pid, done, len(candidates))

    logger.info("پایان | ذخیره: %d | رد شده: %d | خطا: %d", done, skipped, failed)


if __name__ == "__main__":
    main()