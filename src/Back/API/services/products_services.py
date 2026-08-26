import sys
from pathlib import Path
from typing import Optional

BACK_DIR = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Products

from queries.products_kpi_queries import product_kpi_query


STATUS_RECOMMENDATION = {
    "successful": "این کالا عملکرد و رضایت بالایی دارد و کاندید مناسبی برای پروموشن است.",
    "unsuccessful": "این کالا نیازمند بررسی کیفیت، اصالت یا شرایط فروشنده است.",
    "neutral": "وضعیت این کالا متوسط است و نیاز به پایش بیشتر دارد.",
    "insufficient_data": "داده کافی برای ارزیابی دقیق این کالا وجود ندارد.",
}


def get_products(limit: Optional[int] = None):
    with Session(engine) as session:
        query = product_kpi_query.limit(limit or 500)

        kpi_rows = {
            row["product_id"]: row
            for row in session.execute(query).mappings().all()
        }

        product_ids = list(kpi_rows.keys())
        if not product_ids:
            return []

        products = (
            session.query(Products)
            .filter(Products.id.in_(product_ids))
            .all()
        )

        results = []
        for product in products:
            kpi = kpi_rows.get(product.id)
            if not kpi:
                continue

            status = kpi["product_status"]

            results.append({
                "product_id": str(product.id),
                "title_fa": product.title_fa,
                "category1": product.category1 or "عمومی",
                "sub_category": product.sub_category or "",
                "brand": product.brand or "متفرقه",
                "seller": product.seller or "نامشخص",
                "seller_code": None,
                "is_fake": bool(product.is_fake),
                "price": product.price or 0,
                "min_price_last_month": product.min_price_last_month or product.price or 0,
                "raw_product_rate": round((product.rate or 0) / 20, 1),
                "rate_cnt": product.rate_cnt or 0,
                "positive_comments": int(kpi["positive_comments"] or 0),
                "negative_comments": int(kpi["negative_comments"] or 0),
                "bayesian_product_score": float(kpi["bayesian_product_score"] or 0),
                "sentiment_score": float(kpi["sentiment_score"] or 0),
                "product_health_score": float(kpi["product_health_score"] or 0),
                "product_status": status,
        })

        results.sort(key=lambda r: r["product_health_score"], reverse=True)

    return results