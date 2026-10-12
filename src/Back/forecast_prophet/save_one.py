import sys

from sqlalchemy import Integer, cast, func, select
from sqlalchemy.dialects.postgresql import insert

from database.conn import SessionLocal
from database.models import ProductComments, ProductForecasts

from .config import PRODUCT_ID, YEAR_FROM, YEAR_TO
from .service import forecast_product


def main():
    pid = int(sys.argv[1]) if len(sys.argv) > 1 else PRODUCT_ID

    result = forecast_product(pid)
    if result is None:
        print(f"محصول {pid}: داده‌ی ماهانه کافی نیست، ذخیره نشد")
        return

    year = cast(func.split_part(ProductComments.created_at, " ", 3), Integer)

    with SessionLocal() as session:
        cnt = session.execute(
            select(func.count())
            .select_from(ProductComments)
            .where(
                ProductComments.product_id == pid,
                year.between(YEAR_FROM, YEAR_TO),
            )
        ).scalar()

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

    print(f"پیش‌بینی محصول {pid} ذخیره شد")


if __name__ == "__main__":
    main()