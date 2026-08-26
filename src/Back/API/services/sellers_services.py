import sys
from pathlib import Path
from typing import Optional

BACK_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BACK_DIR))

from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Comments, Products
from database.kpi_views import SellerKpiView
from services.cache import timed_cache


STATUS_RECOMMENDATION = {
    "successful": "این فروشنده عملکرد پایداری دارد و ریسک پایینی برای مشتریان ایجاد می‌کند.",
    "unsuccessful": "این فروشنده نیازمند بررسی فوری از نظر اصالت کالا و نرخ مرجوعی است.",
    "neutral": "عملکرد این فروشنده در محدوده متوسط قرار دارد.",
    "insufficient_data": "داده کافی برای ارزیابی این فروشنده وجود ندارد.",
}

SORT_COLUMNS = {
    "health_desc": SellerKpiView.seller_health_score,
    "satisfaction_desc": SellerKpiView.customer_satisfaction_score,
    "comments_desc": SellerKpiView.total_comments,
    "products_desc": SellerKpiView.sold_products,
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


def _seller_category_subquery(session):
    """دسته‌بندی غالب هر فروشنده -- به‌صورت SQL، نه لوپ پایتون."""
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
            .over(partition_by=cat_counts.c.seller_code, order_by=cat_counts.c.cnt.desc())
            .label("rn"),
        )
        .subquery()
    )
    return select(ranked.c.seller_code, ranked.c.category1).where(ranked.c.rn == 1).subquery()


def _apply_filters(stmt, category_sub, status=None, category=None, search=None):
    if status and status != "all":
        stmt = stmt.where(SellerKpiView.seller_status == status)

    if category and category != "all":
        stmt = stmt.where(category_sub.c.category1 == category)

    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(
                SellerKpiView.seller_title.ilike(like),
                SellerKpiView.seller_code.ilike(like),
            )
        )

    return stmt


@timed_cache(ttl_seconds=300)
def get_sellers(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
):
    with Session(engine) as session:
        category_sub = _seller_category_subquery(session)

        base_stmt = (
            select(SellerKpiView, category_sub.c.category1)
            .select_from(SellerKpiView)
            .outerjoin(category_sub, category_sub.c.seller_code == SellerKpiView.seller_code)
        )
        base_stmt = _apply_filters(base_stmt, category_sub, status, category, search)

        # ---- شمارش کل ----
        count_stmt = (
            select(func.count())
            .select_from(SellerKpiView)
            .outerjoin(category_sub, category_sub.c.seller_code == SellerKpiView.seller_code)
        )
        count_stmt = _apply_filters(count_stmt, category_sub, status, category, search)
        total_sellers = session.execute(count_stmt).scalar() or 0

        # ---- صفحه‌ی فعلی ----
        sort_col = SORT_COLUMNS.get(sort, SellerKpiView.seller_health_score)
        offset = (page - 1) * page_size

        list_stmt = (
            base_stmt
            .order_by(sort_col.desc())
            .offset(offset)
            .limit(page_size)
        )

        rows = session.execute(list_stmt).all()

        paginated_results = []
        for seller, seller_category in rows:
            health_score = float(seller.seller_health_score or 0)
            fake_percent = float(seller.fake_product_percent or 0)
            low_rated_percent = float(seller.low_rated_product_percent or 0)
            sat_score = float(seller.customer_satisfaction_score or 0)

            paginated_results.append({
                "seller_code": seller.seller_code,
                "seller_title": seller.seller_title or "نامشخص",
                "grade": _grade_from_score(health_score),
                "city": "نامشخص",
                "category": seller_category or "",
                "sold_products": int(seller.sold_products or 0),
                "total_comments": int(seller.total_comments or 0),
                "positive_comments": int(seller.positive_comments or 0),
                "negative_comments": int(seller.negative_comments or 0),
                "customer_satisfaction_score": sat_score,
                "fake_product_percent": fake_percent,
                "low_rated_product_percent": low_rated_percent,
                "seller_health_score": health_score,
                "seller_status": seller.seller_status,
                "timely_shipping_rate": 0,
                "return_rate": 0,
                "commitment_score": 0,
                "radar_metrics": [],
                "risk_level": _risk_level(fake_percent, low_rated_percent),
                "recommendation": STATUS_RECOMMENDATION.get(seller.seller_status, ""),
            })

        agg_stmt = (
            select(
                func.count().label("total"),
                func.coalesce(func.avg(SellerKpiView.customer_satisfaction_score), 0).label("avg_sat"),
                func.count().filter(SellerKpiView.seller_status == "successful").label("successful"),
                func.count().filter(SellerKpiView.seller_status == "unsuccessful").label("unsuccessful"),
            )
            .select_from(SellerKpiView)
            .outerjoin(category_sub, category_sub.c.seller_code == SellerKpiView.seller_code)
        )
        agg_stmt = _apply_filters(agg_stmt, category_sub, status, category, search)
        agg = session.execute(agg_stmt).mappings().first()

        successful_count = int(agg["successful"] or 0)
        unsuccessful_count = int(agg["unsuccessful"] or 0)
        avg_satisfaction_score = round(float(agg["avg_sat"] or 0), 1)
        avg_seller_rating = round(avg_satisfaction_score / 20, 2) if avg_satisfaction_score else 0

        # ---- مقایسه‌ی عملکرد موفق/ناموفق ----
        def _avg_for_status(seller_status, column):
            stmt = (
                select(func.coalesce(func.avg(column), 0))
                .select_from(SellerKpiView)
                .where(SellerKpiView.seller_status == seller_status)
            )
            return round(float(session.execute(stmt).scalar() or 0), 1)

        performance_comparison = [
            {
                "metric": "رضایت مشتریان",
                "successful": _avg_for_status("successful", SellerKpiView.customer_satisfaction_score),
                "unsuccessful": _avg_for_status("unsuccessful", SellerKpiView.customer_satisfaction_score),
                "unit": "%",
            },
            {
                "metric": "امتیاز سلامت فروشنده",
                "successful": _avg_for_status("successful", SellerKpiView.seller_health_score),
                "unsuccessful": _avg_for_status("unsuccessful", SellerKpiView.seller_health_score),
                "unit": "از ۱۰۰",
            },
            {
                "metric": "نرخ کالای غیراصل / فیک",
                "successful": _avg_for_status("successful", SellerKpiView.fake_product_percent),
                "unsuccessful": _avg_for_status("unsuccessful", SellerKpiView.fake_product_percent),
                "unit": "%",
            },
            {
                "metric": "محصولات کم‌امتیاز",
                "successful": _avg_for_status("successful", SellerKpiView.low_rated_product_percent),
                "unsuccessful": _avg_for_status("unsuccessful", SellerKpiView.low_rated_product_percent),
                "unit": "%",
            },
        ]

        total_pages = (total_sellers + page_size - 1) // page_size if total_sellers else 1

    return {
        "metrics": {
            "total_sellers": int(total_sellers),
            "successful_sellers": successful_count,
            "unsuccessful_sellers": unsuccessful_count,
            "avg_seller_rating": avg_seller_rating,
            "avg_satisfaction_score": avg_satisfaction_score,
        },
        "performanceComparison": performance_comparison,
        "sellers": paginated_results,
        "page": page,
        "page_size": page_size,
        "totalCount": int(total_sellers),
        "totalPages": int(total_pages),
    }