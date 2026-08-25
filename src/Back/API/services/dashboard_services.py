import sys
from pathlib import Path

BACK_DIR = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy import func
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Products, Comments

from queries.comments_kpi_queries import comment_kpi_query
from queries.products_kpi_queries import product_kpi_query
from queries.sellers_kpi_queries import seller_kpi_query


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

        # ---------- Products ----------
        product_rows = session.execute(product_kpi_query).mappings().all()
        total_products = session.query(func.count(Products.id)).scalar() or 0

        successful_products = sum(
            1 for r in product_rows if r["product_status"] == "successful"
        )
        unsuccessful_products = sum(
            1 for r in product_rows if r["product_status"] == "unsuccessful"
        )
        neutral_products = sum(
            1 for r in product_rows if r["product_status"] == "neutral"
        )
        insufficient_products = sum(
            1 for r in product_rows if r["product_status"] == "insufficient_data"
        )

        # ---------- Sellers ----------
        seller_rows = session.execute(seller_kpi_query).mappings().all()
        total_sellers = len(seller_rows)

        successful_sellers = sum(
            1 for r in seller_rows if r["seller_status"] == "successful"
        )
        unsuccessful_sellers = sum(
            1 for r in seller_rows if r["seller_status"] == "unsuccessful"
        )
        neutral_sellers = sum(
            1 for r in seller_rows if r["seller_status"] == "neutral"
        )
        insufficient_sellers = sum(
            1 for r in seller_rows if r["seller_status"] == "insufficient_data"
        )

        # ---------- Aggregates ----------
        avg_health_products = (
            sum(float(r["product_health_score"] or 0) for r in product_rows)
            / len(product_rows)
            if product_rows else 0
        )
        avg_health_sellers = (
            sum(float(r["seller_health_score"] or 0) for r in seller_rows)
            / len(seller_rows)
            if seller_rows else 0
        )

        if product_rows or seller_rows:
            avg_health_score = round(
                (avg_health_products + avg_health_sellers) / 2, 2
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