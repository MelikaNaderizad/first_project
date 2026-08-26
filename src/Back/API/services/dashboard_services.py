import sys
from pathlib import Path

BACK_DIR = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy import func, select, case
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Products, Comments

from queries.comments_kpi_queries import (
    comment_kpi_query,
    positive_comments_filter,
    negative_comments_filter,
)
from queries.products_kpi_queries import product_kpi_query
from queries.sellers_kpi_queries import seller_kpi_query

from services.cache import timed_cache
from services.comments_services import get_comments


PERSIAN_MONTH_ORDER = {
    "فروردین": 1, "اردیبهشت": 2, "خرداد": 3, "تیر": 4, "مرداد": 5, "شهریور": 6,
    "مهر": 7, "آبان": 8, "آذر": 9, "دی": 10, "بهمن": 11, "اسفند": 12,
}


def _status_agg(subquery, status_col):
    return select(
        func.count().label("total"),
        func.coalesce(
            func.sum(case((status_col == "successful", 1), else_=0)), 0
        ).label("successful"),
        func.coalesce(
            func.sum(case((status_col == "unsuccessful", 1), else_=0)), 0
        ).label("unsuccessful"),
        func.coalesce(
            func.sum(case((status_col == "neutral", 1), else_=0)), 0
        ).label("neutral"),
        func.coalesce(
            func.sum(case((status_col == "insufficient_data", 1), else_=0)), 0
        ).label("insufficient"),
    ).select_from(subquery)


def _get_sentiment_timeline(session):
    month_expr = func.split_part(Comments.created_at, " ", 2)

    order_case = case(
        *[(month_expr == name, idx) for name, idx in PERSIAN_MONTH_ORDER.items()],
        else_=0,
    )

    query = (
        select(
            month_expr.label("month"),
            func.count().filter(positive_comments_filter()).label("positive"),
            func.count().filter(negative_comments_filter()).label("negative"),
            func.count().label("total"),
        )
        .select_from(Comments)
        .where(month_expr != "")
        .group_by(month_expr)
        .order_by(order_case)
        .limit(6)
    )

    rows = session.execute(query).mappings().all()

    timeline = []
    for row in rows:
        positive = int(row["positive"] or 0)
        negative = int(row["negative"] or 0)
        total = int(row["total"] or 0)
        timeline.append({
            "month": row["month"],
            "positive": positive,
            "negative": negative,
            "neutral": max(total - positive - negative, 0),
            "total": total,
        })

    return timeline


def _get_category_distribution(session):
    query = (
        select(
            Products.category1.label("category"),
            func.count().label("total"),
            func.count().filter(positive_comments_filter()).label("positive"),
            func.count().filter(negative_comments_filter()).label("negative"),
        )
        .select_from(Comments)
        .join(Products, Products.id == Comments.product_id)
        .where(Products.category1.isnot(None))
        .group_by(Products.category1)
        .order_by(func.count().desc())
        .limit(4)
    )

    rows = session.execute(query).mappings().all()

    result = []
    for row in rows:
        total = int(row["total"] or 0)
        positive = int(row["positive"] or 0)
        negative = int(row["negative"] or 0)
        result.append({
            "category": row["category"],
            "total": total,
            "positive": positive,
            "negative": negative,
            "positivePercentage": round((positive / total) * 100, 1) if total else 0,
            "negativePercentage": round((negative / total) * 100, 1) if total else 0,
        })

    return result


def _get_top_bottom_seller(session):
    seller_sub = seller_kpi_query.subquery()

    top_row = session.execute(
        select(seller_sub)
        .where(seller_sub.c.sold_products > 0)
        .order_by(seller_sub.c.seller_health_score.desc())
        .limit(1)
    ).mappings().first()

    bottom_row = session.execute(
        select(seller_sub)
        .where(seller_sub.c.sold_products > 0)
        .order_by(seller_sub.c.seller_health_score.asc())
        .limit(1)
    ).mappings().first()

    def _to_seller_item(row):
        if not row:
            return {}
        return {
            "seller_code": row["seller_code"],
            "seller_title": row["seller_title"] or "نامشخص",
            "sold_products": int(row["sold_products"] or 0),
            "total_comments": int(row["total_comments"] or 0),
            "positive_comments": int(row["positive_comments"] or 0),
            "negative_comments": int(row["negative_comments"] or 0),
            "customer_satisfaction_score": float(row["customer_satisfaction_score"] or 0),
            "fake_product_percent": float(row["fake_product_percent"] or 0),
            "low_rated_product_percent": float(row["low_rated_product_percent"] or 0),
            "seller_health_score": float(row["seller_health_score"] or 0),
            "seller_status": row["seller_status"],
        }

    return _to_seller_item(top_row), _to_seller_item(bottom_row)


def _get_top_bottom_product(session):
    product_sub = product_kpi_query.subquery()

    top_row = session.execute(
        select(product_sub)
        .where(product_sub.c.rate_cnt > 0)
        .order_by(product_sub.c.product_health_score.desc())
        .limit(1)
    ).mappings().first()

    bottom_row = session.execute(
        select(product_sub)
        .where(product_sub.c.rate_cnt > 0)
        .order_by(product_sub.c.product_health_score.asc())
        .limit(1)
    ).mappings().first()

    def _to_product_item(row):
        if not row:
            return {}
        return {
            "id": str(row["product_id"]),
            "product_id": str(row["product_id"]),
            "title_fa": row["title_fa"],
            "rate": round(float(row["raw_product_rate"] or 0) / 20, 1),
            "raw_product_rate": round(float(row["raw_product_rate"] or 0) / 20, 1),
            "rate_cnt": int(row["rate_cnt"] or 0),
            "positive_comments": int(row["positive_comments"] or 0),
            "negative_comments": int(row["negative_comments"] or 0),
            "bayesian_product_score": float(row["bayesian_product_score"] or 0),
            "sentiment_score": float(row["sentiment_score"] or 0),
            "product_health_score": float(row["product_health_score"] or 0),
            "product_status": row["product_status"],
        }

    return _to_product_item(top_row), _to_product_item(bottom_row)


@timed_cache(ttl_seconds=300)
def get_dashboard_overview():
    with Session(engine) as session:

        # ---------- Comments ----------
        comment_result = session.execute(comment_kpi_query).mappings().first()
        positive_comments = int(comment_result["positive_comments"] or 0)
        negative_comments = int(comment_result["negative_comments"] or 0)

        total_comments = session.query(func.count(Comments.id)).scalar() or 0
        neutral_comments = max(
            total_comments - positive_comments - negative_comments, 0
        )

        avg_rating = session.execute(
            select(func.coalesce(func.avg(Comments.rate), 0))
        ).scalar() or 0

        # ---------- Products ----------
        product_sub = product_kpi_query.subquery()

        product_status_row = session.execute(
            _status_agg(product_sub, product_sub.c.product_status)
        ).mappings().first()

        total_products = session.query(func.count(Products.id)).scalar() or 0
        successful_products = int(product_status_row["successful"] or 0)
        unsuccessful_products = int(product_status_row["unsuccessful"] or 0)

        # ---------- Sellers ----------
        seller_sub = seller_kpi_query.subquery()

        seller_status_row = session.execute(
            _status_agg(seller_sub, seller_sub.c.seller_status)
        ).mappings().first()

        total_sellers = int(seller_status_row["total"] or 0)
        successful_sellers = int(seller_status_row["successful"] or 0)
        unsuccessful_sellers = int(seller_status_row["unsuccessful"] or 0)

        # ---------- Derived KPIs ----------
        kpis = {
            "total_comments": int(total_comments),
            "positive_comments": positive_comments,
            "negative_comments": negative_comments,
            "positive_percentage": round((positive_comments / total_comments) * 100, 1) if total_comments else 0,
            "negative_percentage": round((negative_comments / total_comments) * 100, 1) if total_comments else 0,
            "neutral_percentage": round((neutral_comments / total_comments) * 100, 1) if total_comments else 0,
            "average_rating": round(float(avg_rating), 2),
            "total_sellers": total_sellers,
            "successful_sellers": successful_sellers,
            "unsuccessful_sellers": unsuccessful_sellers,
            "seller_success_rate": round((successful_sellers / total_sellers) * 100, 1) if total_sellers else 0,
            "total_products": int(total_products),
            "successful_products": successful_products,
            "unsuccessful_products": unsuccessful_products,
            "product_success_rate": round((successful_products / total_products) * 100, 1) if total_products else 0,
        }

        sentiment_timeline = _get_sentiment_timeline(session)
        category_distribution = _get_category_distribution(session)
        top_seller, weakest_seller = _get_top_bottom_seller(session)
        top_product, weakest_product = _get_top_bottom_product(session)

    recent_comments_res = get_comments(page=1, page_size=6)
    recent_comments = recent_comments_res.get("comments", [])

    return {
        "kpis": kpis,
        "sentimentTimeline": sentiment_timeline,
        "categoryDistribution": category_distribution,
        "topSeller": top_seller,
        "weakestSeller": weakest_seller,
        "topProduct": top_product,
        "weakestProduct": weakest_product,
        "recentComments": recent_comments,
    }