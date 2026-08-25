import sys
from pathlib import Path

BACK_DIR = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy import func
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Comments, Products

from queries.comments_kpi_queries import comment_kpi_query


def _split_list_field(value):
    if not value:
        return []
    return [item.strip() for item in value.split("، ") if item.strip()]


def _derive_sentiment(comment: Comments):
    rate = comment.rate or 0
    status = comment.recommendation_status

    if status == "recommended" and rate >= 4:
        sentiment = "positive"
    elif status == "not_recommended" and rate <= 2:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    sentiment_score = round((rate / 5) * 100) if rate else 50
    return sentiment, sentiment_score


def _serialize_comment(comment: Comments, product: Products | None):
    sentiment, sentiment_score = _derive_sentiment(comment)

    return {
        "id": f"CMT-{comment.id}",
        "product_id": str(comment.product_id) if comment.product_id else "",
        "product_title": product.title_fa if product else "نامشخص",
        "seller_title": comment.seller_title or "نامشخص",
        "user_name": "کاربر دیجی‌کالا",
        "rating": int(comment.rate) if comment.rate else 0,
        "sentiment": sentiment,
        "sentiment_score": sentiment_score,
        "title": comment.title or "",
        "comment_text": comment.body or "",
        "created_at": comment.created_at or "",
        "is_buyer": bool(comment.is_buyer),
        "recommendation_status": comment.recommendation_status or "no_idea",
        "likes_count": comment.likes or 0,
        "dislikes_count": comment.dislikes or 0,
        "category": product.category1 if product and product.category1 else "نامشخص",
        "pros": _split_list_field(comment.advantages),
        "cons": _split_list_field(comment.disadvantages),
    }


def get_comments(page: int = 1, page_size: int = 21):
    with Session(engine) as session:
        total = session.query(func.count(Comments.id)).scalar() or 0
        offset = (page - 1) * page_size

        rows = (
            session.query(Comments, Products)
            .outerjoin(Products, Products.id == Comments.product_id)
            .order_by(Comments.id.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        items = [
            _serialize_comment(comment, product)
            for comment, product in rows
        ]

    total_pages = max((total + page_size - 1) // page_size, 1) if total else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


