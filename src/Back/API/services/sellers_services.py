import sys
from pathlib import Path
from typing import Optional

BACK_DIR = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy.orm import Session

from database.conn import engine

from queries.sellers_kpi_queries import seller_kpi_query


STATUS_RECOMMENDATION = {
    "successful": "این فروشنده عملکرد پایداری دارد و ریسک پایینی برای مشتریان ایجاد می‌کند.",
    "unsuccessful": "این فروشنده نیازمند بررسی فوری از نظر اصالت کالا و نرخ مرجوعی است.",
    "neutral": "عملکرد این فروشنده در محدوده متوسط قرار دارد.",
    "insufficient_data": "داده کافی برای ارزیابی این فروشنده وجود ندارد.",
}


def _grade_from_score(score: float) -> str:
    if score >= 90:
        return "A+"
    if score >= 75:
        return "A"
    if score >= 60:
        return "B"
    if score >= 40:
        return "C"
    return "D"


def _risk_level(fake_percent: float, low_rated_percent: float) -> str:
    if fake_percent >= 25 or low_rated_percent >= 40:
        return "critical"
    if fake_percent >= 10 or low_rated_percent >= 20:
        return "high"
    if fake_percent >= 3 or low_rated_percent >= 10:
        return "medium"
    return "low"


def get_sellers(limit: Optional[int] = None):
    with Session(engine) as session:
        query = seller_kpi_query.limit(limit or 500)

        rows = session.execute(query).mappings().all()

        results = []
        for row in rows:
            health_score = float(row["seller_health_score"] or 0)
            fake_percent = float(row["fake_product_percent"] or 0)
            low_rated_percent = float(row["low_rated_product_percent"] or 0)
            status = row["seller_status"]

            results.append({
                "seller_code": row["seller_code"],
                "seller_title": row["seller_title"] or "نامشخص",
                "grade": _grade_from_score(health_score),
                "city": "نامشخص",
                "sold_products": int(row["sold_products"] or 0),
                "total_comments": int(row["total_comments"] or 0),
                "positive_comments": int(row["positive_comments"] or 0),
                "negative_comments": int(row["negative_comments"] or 0),
                "customer_satisfaction_score": float(row["customer_satisfaction_score"] or 0),
                "fake_product_percent": fake_percent,
                "low_rated_product_percent": low_rated_percent,
                "seller_health_score": health_score,
                "seller_status": status,
                "timely_shipping_rate": 0,
                "return_rate": 0,
                "commitment_score": 0,
                "radar_metrics": [],
                "risk_level": _risk_level(fake_percent, low_rated_percent),
                "recommendation": STATUS_RECOMMENDATION.get(status, ""),
            })

        results.sort(key=lambda r: r["seller_health_score"], reverse=True)

    return results