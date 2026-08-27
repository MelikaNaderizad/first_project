import sys
from pathlib import Path
from typing import Optional

BACK_DIR = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Comments, Products

from queries.comments_kpi_queries import positive_comments_filter, negative_comments_filter
from services.cache import timed_cache


def _split_list_field(value):
    if not value:
        return []
    return [item.strip() for item in value.split("، ") if item.strip()]


def _derive_sentiment(rate: float, status: str):
    if status == "recommended" and rate >= 4:
        sentiment = "positive"
    elif status == "not_recommended" and rate <= 2:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    sentiment_score = round((rate / 5) * 100) if rate else 50
    return sentiment, sentiment_score


def _serialize_comment(comment: Comments, product: Optional[Products]):
    rate = float(comment.rate) if comment.rate is not None else 0
    sentiment, sentiment_score = _derive_sentiment(rate, comment.recommendation_status)

    return {
        "id": f"CMT-{comment.id}",
        "title": comment.title or "",
        "body": comment.body or "",
        "created_at": comment.created_at or "",
        "rate": rate,
        "recommendation_status": comment.recommendation_status or "no_idea",
        "is_buyer": bool(comment.is_buyer),
        "product_id": str(comment.product_id) if comment.product_id else "",
        "product_title_fa": product.title_fa if product else None,
        "advantages": _split_list_field(comment.advantages),
        "disadvantages": _split_list_field(comment.disadvantages),
        "likes": comment.likes or 0,
        "dislikes": comment.dislikes or 0,
        "seller_title": comment.seller_title or "نامشخص",
        "seller_code": comment.seller_code or "",
        "true_to_size_rate": comment.true_to_size_rate,
        "category": product.category1 if product and product.category1 else None,
        "sentiment": sentiment,
        "sentiment_score": sentiment_score,
    }


def _build_filters(sentiment=None, rating=None, category=None, search=None):
    conditions = []

    if sentiment == "positive":
        conditions.append(positive_comments_filter())
    elif sentiment == "negative":
        conditions.append(negative_comments_filter())

    if rating and rating != "all":
        try:
            rating_val = int(rating)
            conditions.append(func.round(Comments.rate) == rating_val)
        except ValueError:
            pass

    if category and category != "all":
        conditions.append(Products.category1 == category)

    if search:
        like = f"%{search}%"
        conditions.append(
            or_(
                Comments.title.ilike(like),
                Comments.body.ilike(like),
                Comments.seller_title.ilike(like),
                Comments.seller_code.ilike(like),
            )
        )

    return conditions


@timed_cache(ttl_seconds=120)
def get_comments(
    cursor: Optional[int] = None,
    limit: int = 20,
    sentiment: Optional[str] = None,
    rating: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    with Session(engine) as session:
        conditions = _build_filters(sentiment, rating, category, search)
        needs_join = bool(category and category != "all")

        # ---- شمارش کل: فقط id رو می‌شماریم، نه کل ستون‌ها ----
        count_stmt = select(func.count(Comments.id)).select_from(Comments)
        if needs_join:
            count_stmt = count_stmt.join(Products, Products.id == Comments.product_id)
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total_comments = session.execute(count_stmt).scalar() or 0

        # ---- متریک‌های positive/negative/avg روی همون شرط، بدون JOIN اضافه اگر لازم نباشه ----
        metrics_stmt = select(
            func.count().filter(positive_comments_filter()).label("positive"),
            func.count().filter(negative_comments_filter()).label("negative"),
            func.coalesce(func.avg(Comments.rate), 0).label("avg_rating"),
            func.count(func.distinct(Comments.product_id)).label("distinct_products"),
        ).select_from(Comments)
        if needs_join:
            metrics_stmt = metrics_stmt.join(Products, Products.id == Comments.product_id)
        if conditions:
            metrics_stmt = metrics_stmt.where(and_(*conditions))

        m = session.execute(metrics_stmt).mappings().first()
        positive_comments = int(m["positive"] or 0)
        negative_comments = int(m["negative"] or 0)
        avg_rating = float(m["avg_rating"] or 0)
        distinct_products = int(m["distinct_products"] or 0)

        positive_rate = round((positive_comments / total_comments) * 100, 1) if total_comments else 0
        negative_rate = round((negative_comments / total_comments) * 100, 1) if total_comments else 0
        avg_comments_per_product = round(total_comments / distinct_products, 1) if distinct_products else 0

        # ---- توزیع ستاره ----
        dist_stmt = select(
            func.round(Comments.rate).label("star"),
            func.count().label("cnt"),
        ).select_from(Comments)
        if needs_join:
            dist_stmt = dist_stmt.join(Products, Products.id == Comments.product_id)
        if conditions:
            dist_stmt = dist_stmt.where(and_(*conditions))
        dist_stmt = dist_stmt.group_by(func.round(Comments.rate))

        dist_rows = session.execute(dist_stmt).mappings().all()
        dist_map = {int(r["star"]): int(r["cnt"]) for r in dist_rows if r["star"] is not None}

        rating_distribution = []
        for star in [5, 4, 3, 2, 1]:
            cnt = dist_map.get(star, 0)
            pct = round((cnt / total_comments) * 100, 1) if total_comments else 0
            rating_distribution.append({
                "stars": f"{star} ستاره",
                "count": cnt,
                "percentage": pct,
                "color": "#10B981" if star >= 4 else ("#FBBF24" if star == 3 else "#EF4444"),
            })

        # ---- صفحهٔ فعلی (اینجا JOIN لازمه چون عنوان محصول رو نشون می‌دیم) ----
        list_stmt = (
            select(Comments, Products)
            .select_from(Comments)
            .outerjoin(Products, Products.id == Comments.product_id)
        )
        if conditions:
            list_stmt = list_stmt.where(and_(*conditions))

        if cursor is not None:
            list_stmt = list_stmt.where(Comments.id < cursor)

        list_stmt = (
            list_stmt
            .order_by(Comments.id.desc())
            .limit(limit + 1)
        )

        rows = session.execute(list_stmt).all()

        has_next = len(rows) > limit

        if has_next:
            rows = rows[:limit]

        items = [_serialize_comment(c, p) for c, p in rows]

        next_cursor = None

        if has_next and rows:
            next_cursor = rows[-1][0].id


    return {
    "metrics": {
        "total_comments": total_comments,
        "positive_comments": positive_comments,
        "negative_comments": negative_comments,
        "positive_rate": positive_rate,
        "negative_rate": negative_rate,
        "average_rating": round(avg_rating, 2),
        "avg_comments_per_product": avg_comments_per_product,
        "change_rate": "—",
    },

    "ratingDistribution": rating_distribution,

    "comments": items,

    "totalCount": total_comments,

    "limit": limit,

    "next_cursor": next_cursor,

    "has_next": has_next,
}