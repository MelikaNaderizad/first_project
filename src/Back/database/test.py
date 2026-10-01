from sqlalchemy import select
from database.conn import SessionLocal
from database.analytics_models import ProductSalesAnalysis


with SessionLocal() as db:
    results = db.execute(
        select(ProductSalesAnalysis).limit(10)
    ).scalars().all()

    for row in results:
        print(
            row.product_id,
            row.product_name,
            row.sale_date
        )