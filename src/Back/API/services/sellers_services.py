import sys
from pathlib import Path
from typing import Optional

BACK_DIR = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Comments, Products

from queries.sellers_kpi_queries import seller_kpi_query
from services.cache import timed_cache


STATUS_RECOMMENDATION = {
    "successful": "این فروشنده عملکرد پایداری دارد و ریسک پایینی برای مشتریان ایجاد می‌کند.",
    "unsuccessful": "این فروشنده نیازمند بررسی فوری از نظر اصالت کالا و نرخ مرجوعی است.",
    "neutral": "عملکرد این فروشنده در محدوده متوسط قرار دارد.",
    "insufficient_data": "داده کافی برای ارزیابی این فروشنده وجود ندارد.",
}

SORT_KEYS = {
    "health_desc": "seller_health_score",
    "satisfaction_desc": "customer_satisfaction_score",
    "comments_desc": "total_comments",
    "products_desc": "sold_products",
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


def _seller_categories(session):
    """پرتکرارترین دسته‌بندی محصولات هر فروشنده (به عنوان دستهٔ اصلی فروشنده)."""
    cat_counts = (
        select(
            Comments.seller_code.label("seller_code"),
            Products.category1.label("category1"),
            func.count().label("cnt"),
        )
        .select_from(Comments)
        .join(Products, Products.id == Comments.product_id)
        .where(Comments.seller_code.isnot(None), Products.category1.isnot(None))
        .group_by(Comments.seller_code, Products.category1)
        .subquery()
    )

    ranked = (
        select(
            cat_counts.c.seller_code,
            cat_counts.c.category1,
            func.row_number()
            .over(
                partition_by=cat_counts.c.seller_code,
                order_by=cat_counts.c.cnt.desc(),
            )
            .label("rn"),
        )
        .subquery()
    )

    rows = session.execute(
        select(ranked.c.seller_code, ranked.c.category1).where(ranked.c.rn == 1)
    ).all()

    return {row.seller_code: row.category1 for row in rows}


@timed_cache(ttl_seconds=300)
def get_sellers(
    limit: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
):
    with Session(engine) as session:
        seller_categories = _seller_categories(session)
        rows = session.execute(seller_kpi_query).mappings().all()

        results = []
        for row in rows:
            seller_code = row["seller_code"]
            seller_category = seller_categories.get(seller_code, "")

            if status and status != "all" and row["seller_status"] != status:
                continue
            if category and category != "all" and seller_category != category:
                continue
            if search:
                needle = search.strip().lower()
                haystack = f'{row["seller_title"] or ""} {seller_code or ""}'.lower()
                if needle not in haystack:
                    continue

            health_score = float(row["seller_health_score"] or 0)
            fake_percent = float(row["fake_product_percent"] or 0)
            low_rated_percent = float(row["low_rated_product_percent"] or 0)
            sat_score = float(row["customer_satisfaction_score"] or 0)
            seller_status = row["seller_status"]

            results.append({
                "seller_code": seller_code,
                "seller_title": row["seller_title"] or "نامشخص",
                "grade": _grade_from_score(health_score),
                "city": "نامشخص",
                "category": seller_category,
                "sold_products": int(row["sold_products"] or 0),
                "total_comments": int(row["total_comments"] or 0),
                "positive_comments": int(row["positive_comments"] or 0),
                "negative_comments": int(row["negative_comments"] or 0),
                "customer_satisfaction_score": sat_score,
                "fake_product_percent": fake_percent,
                "low_rated_product_percent": low_rated_percent,
                "seller_health_score": health_score,
                "seller_status": seller_status,
                "timely_shipping_rate": 0,
                "return_rate": 0,
                "commitment_score": 0,
                "radar_metrics": [],
                "risk_level": _risk_level(fake_percent, low_rated_percent),
                "recommendation": STATUS_RECOMMENDATION.get(seller_status, ""),
            })

        sort_key = SORT_KEYS.get(sort, "seller_health_score")
        results.sort(key=lambda r: r.get(sort_key, 0) or 0, reverse=True)

        total_sellers = len(results)
        successful = [r for r in results if r["seller_status"] == "successful"]
        unsuccessful = [r for r in results if r["seller_status"] == "unsuccessful"]

        def _avg(items, key):
            return round(sum(i[key] for i in items) / len(items), 1) if items else 0

        avg_satisfaction_score = _avg(results, "customer_satisfaction_score")
        avg_seller_rating = round(avg_satisfaction_score / 20, 2) if avg_satisfaction_score else 0

        performance_comparison = [
            {
                "metric": "رضایت مشتریان",
                "successful": _avg(successful, "customer_satisfaction_score"),
                "unsuccessful": _avg(unsuccessful, "customer_satisfaction_score"),
                "unit": "%",
            },
            {
                "metric": "امتیاز سلامت فروشنده",
                "successful": _avg(successful, "seller_health_score"),
                "unsuccessful": _avg(unsuccessful, "seller_health_score"),
                "unit": "از ۱۰۰",
            },
            {
                "metric": "نرخ کالای غیراصل / فیک",
                "successful": _avg(successful, "fake_product_percent"),
                "unsuccessful": _avg(unsuccessful, "fake_product_percent"),
                "unit": "%",
            },
            {
                "metric": "محصولات کم‌امتیاز",
                "successful": _avg(successful, "low_rated_product_percent"),
                "unsuccessful": _avg(unsuccessful, "low_rated_product_percent"),
                "unit": "%",
            },
        ]

        limited_results = results[: (limit or 500)]

    return {
        "metrics": {
            "total_sellers": total_sellers,
            "successful_sellers": len(successful),
            "unsuccessful_sellers": len(unsuccessful),
            "avg_seller_rating": avg_seller_rating,
            "avg_satisfaction_score": avg_satisfaction_score,
        },
        "performanceComparison": performance_comparison,
        "sellers": limited_results,
    }