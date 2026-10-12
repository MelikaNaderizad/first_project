import sys
from pathlib import Path
from typing import Optional

BACK_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BACK_DIR))

from sqlalchemy import select
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Products, ProductForecasts
from services.cache import timed_cache


@timed_cache(ttl_seconds=300)
def list_forecast_products(search: Optional[str] = None, limit: int = 20):
    stmt = (
        select(
            ProductForecasts.product_id,
            ProductForecasts.total_comments,
            ProductForecasts.mae,
            ProductForecasts.baseline_mae,
            Products.title_fa,
            Products.brand,
            Products.category1,
        )
        .join(Products, Products.id == ProductForecasts.product_id)
        .order_by(ProductForecasts.total_comments.desc())
        .limit(limit)
    )
    if search:
        stmt = stmt.where(Products.title_fa.ilike(f"%{search}%"))

    with Session(engine) as session:
        rows = session.execute(stmt).mappings().all()

    return {
        "products": [
            {
                "id": str(r["product_id"]),
                "title_fa": r["title_fa"],
                "brand": r["brand"] or "متفرقه",
                "category1": r["category1"] or "عمومی",
                "total_comments": r["total_comments"],
                "mae": r["mae"],
                "baseline_mae": r["baseline_mae"],
            }
            for r in rows
        ]
    }


@timed_cache(ttl_seconds=300)
def get_product_forecast(product_id: int):
    stmt = (
        select(ProductForecasts.payload, Products.title_fa, Products.brand, Products.category1)
        .join(Products, Products.id == ProductForecasts.product_id)
        .where(ProductForecasts.product_id == product_id)
    )
    with Session(engine) as session:
        row = session.execute(stmt).mappings().first()

    if row is None:
        return None

    return {
        "product": {
            "id": str(product_id),
            "title_fa": row["title_fa"],
            "brand": row["brand"] or "متفرقه",
            "category1": row["category1"] or "عمومی",
        },
        **row["payload"],
    }