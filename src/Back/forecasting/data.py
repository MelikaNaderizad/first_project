import pandas as pd
from sqlalchemy import select, func, case, cast, Integer

from database.conn import SessionLocal
from database.models import ProductComments

MONTHS = {
    "فروردین": 1, "اردیبهشت": 2, "خرداد": 3,
    "تیر": 4, "مرداد": 5, "شهریور": 6,
    "مهر": 7, "آبان": 8, "آذر": 9,
    "دی": 10, "بهمن": 11, "اسفند": 12,
}


def load_monthly_series():
    # created_at یک متن است مثل «۲۳ تیر ۱۳۹۵»؛ با split_part تکه‌هایش را جدا می‌کنیم
    year_expr = cast(func.split_part(ProductComments.created_at, " ", 3), Integer)
    month_expr = case(MONTHS, value=func.split_part(ProductComments.created_at, " ", 2))

    year = year_expr.label("year")
    month = month_expr.label("month")

    stmt = (
        select(year, month, func.count().label("comment_count"))
        .where(ProductComments.is_buyer.is_(True), year_expr >= 1398)
        .group_by(year, month)
        .order_by(year, month)
    )

    with SessionLocal() as session:
        rows = session.execute(stmt).all()

    df = pd.DataFrame(rows, columns=["year", "month", "comment_count"])
    df = df.sort_values(["year", "month"]).reset_index(drop=True)
    df["t"] = (df["year"] - df["year"].min()) * 12 + df["month"]
    return df