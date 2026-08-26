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

from queries.comments_kpi_queries import comment_kpi_query
from queries.products_kpi_queries import product_kpi_query
from queries.sellers_kpi_queries import seller_kpi_query


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

        # ---------- Products (aggregated in SQL, not pulled into Python) ----------
        product_sub = product_kpi_query.subquery()

        product_status_row = session.execute(
            _status_agg(product_sub, product_sub.c.product_status)
        ).mappings().first()

        avg_health_products = session.execute(
            select(func.coalesce(func.avg(product_sub.c.product_health_score), 0))
        ).scalar() or 0

        total_products = session.query(func.count(Products.id)).scalar() or 0
        successful_products = product_status_row["successful"]
        unsuccessful_products = product_status_row["unsuccessful"]
        neutral_products = product_status_row["neutral"]
        insufficient_products = product_status_row["insufficient"]

        # ---------- Sellers (aggregated in SQL) ----------
        seller_sub = seller_kpi_query.subquery()

        seller_status_row = session.execute(
            _status_agg(seller_sub, seller_sub.c.seller_status)
        ).mappings().first()

        avg_health_sellers = session.execute(
            select(func.coalesce(func.avg(seller_sub.c.seller_health_score), 0))
        ).scalar() or 0

        total_sellers = seller_status_row["total"]
        successful_sellers = seller_status_row["successful"]
        unsuccessful_sellers = seller_status_row["unsuccessful"]
        neutral_sellers = seller_status_row["neutral"]
        insufficient_sellers = seller_status_row["insufficient"]

        # ---------- Aggregates ----------
        if product_status_row["total"] or total_sellers:
            avg_health_score = round(
                (float(avg_health_products) + float(avg_health_sellers)) / 2, 2
            )
        else:
            avg_health_score = 0

        overall_sentiment = (
            round((positive_comments / total_comments) * 100, 2)
            if total_comments else 0
        )

    return {
        "total_sellers": total_sellers,
        "total_comments": total_comments,
        "total_products": total_products,
        "successful_sellers": successful_sellers,
        "positive_comments": positive_comments,
        "successful_products": successful_products,
        "unsuccessful_sellers": unsuccessful_sellers,
        "negative_comments": negative_comments,
        "unsuccessful_products": unsuccessful_products,
        "neutral_comments": neutral_comments,
        "neutral_products": neutral_products,
        "insufficient_products": insufficient_products,
        "neutral_sellers": neutral_sellers,
        "insufficient_sellers": insufficient_sellers,
        "avg_health_score": avg_health_score,
        "overall_sentiment": overall_sentiment,
    }