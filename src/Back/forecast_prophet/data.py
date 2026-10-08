import jdatetime
import pandas as pd
from sqlalchemy import select, func, case, cast, Integer

from database.conn import SessionLocal
from database.models import ProductComments

from .config import PRODUCT_ID, YEAR_FROM, YEAR_TO, TEST_MONTHS

MONTHS = {
    "فروردین": 1, "اردیبهشت": 2, "خرداد": 3,
    "تیر": 4, "مرداد": 5, "شهریور": 6,
    "مهر": 7, "آبان": 8, "آذر": 9,
    "دی": 10, "بهمن": 11, "اسفند": 12,
}


def load_monthly(product_id: int = PRODUCT_ID) -> pd.DataFrame:
    """تعداد کامنت هر ماه برای یک محصول (فقط ماه‌هایی که کامنت دارن)."""
    year_expr = cast(func.split_part(ProductComments.created_at, " ", 3), Integer)
    month_expr = case(MONTHS, value=func.split_part(ProductComments.created_at, " ", 2))
    year = year_expr.label("year")
    month = month_expr.label("month")

    stmt = (
        select(year, month, func.count().label("y"))
        .where(
            ProductComments.product_id == product_id,
            year_expr.between(YEAR_FROM, YEAR_TO),
        )
        .group_by(year, month)
        .order_by(year, month)
    )

    with SessionLocal() as session:
        rows = session.execute(stmt).all()

    df = pd.DataFrame(rows, columns=["year", "month", "y"]).dropna(subset=["month"]) #اونایی که ماهشون nullهست رو حذف میکنه 

    # روز ۱۵ ماه شمسی -> میلادی -> اولین روز همان ماه میلادی
    df["ds"] = [
        pd.Timestamp(jdatetime.date(int(y), int(m), 15).togregorian()).replace(day=1)
        for y, m in zip(df["year"], df["month"])
    ]
    return df[["ds", "y"]]


def build_series(product_id: int = PRODUCT_ID) -> pd.DataFrame:
    """سری کامل ماهانه؛ ماه‌های بدون کامنت با صفر پر میشن که الگوریتم بتونه در نظر بگیره."""
    df = load_monthly(product_id).set_index("ds")
    full_index = pd.date_range(df.index.min(), df.index.max(), freq="MS") # -> MS: month start
    return df.reindex(full_index, fill_value=0).rename_axis("ds").reset_index()


def split_train_test(df: pd.DataFrame, test_months: int = TEST_MONTHS):
    return df.iloc[:-test_months], df.iloc[-test_months:]