from django.db.models import Avg, Count, Q
from django.db.models.functions import Round
import hashlib
import json

from .models import Comment

POSITIVE = Q(recommendation_status="recommended", rate__gte=4)
NEGATIVE = Q(recommendation_status="not_recommended", rate__lte=2)


def _split_list_field(value):
    if not value:
        return []
    return [i.strip() for i in value.split("، ") if i.strip()]


def _derive_sentiment(rate, status):
    if status == "recommended" and rate >= 4:
        sentiment = "positive"
    elif status == "not_recommended" and rate <= 2:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    score = round((rate / 5) * 100) if rate else 50
    return sentiment, score


def _serialize(c):
    rate = float(c.rate) if c.rate is not None else 0
    sentiment, score = _derive_sentiment(rate, c.recommendation_status)
    p = c.product
    return {
        "id": f"CMT-{c.id}",
        "title": c.title or "",
        "body": c.body or "",
        "created_at": c.created_at or "",
        "rate": rate,
        "recommendation_status": c.recommendation_status or "no_idea",
        "is_buyer": bool(c.is_buyer),
        "product_id": str(c.product_id) if c.product_id else "",
        "product_title_fa": p.title_fa if p else None,
        "advantages": _split_list_field(c.advantages),
        "disadvantages": _split_list_field(c.disadvantages),
        "likes": c.likes or 0,
        "dislikes": c.dislikes or 0,
        "seller_title": c.seller_title or "نامشخص",
        "seller_code": c.seller_code or "",
        "true_to_size_rate": c.true_to_size_rate,
        "category": p.category1 if p and p.category1 else None,
        "sentiment": sentiment,
        "sentiment_score": score,
    }


def _build_filters(sentiment, rating, category, search):
    q = Q()
    if sentiment == "positive":
        q &= POSITIVE
    elif sentiment == "negative":
        q &= NEGATIVE
    if rating and rating != "all":
        try:
            q &= Q(star=int(rating))
        except ValueError:
            pass
    if category and category != "all":
        q &= Q(product__category1=category)
    if search:
        q &= (
            Q(title__icontains=search)
            | Q(body__icontains=search)
            | Q(seller_title__icontains=search)
            | Q(seller_code__icontains=search)
        )
    return q


def get_comments(cursor=None, limit=20, sentiment=None, rating=None,
                 category=None, search=None):
    base = Comment.objects.annotate(star=Round("rate")).filter(
        _build_filters(sentiment, rating, category, search)
    )

    # متریک‌ها (بدون cursor، روی کل نتیجه‌ی فیلتر)
    agg = base.aggregate(
        total=Count("id"),
        positive=Count("id", filter=POSITIVE),
        negative=Count("id", filter=NEGATIVE),
        avg_rating=Avg("rate"),
        distinct_products=Count("product_id", distinct=True),
    )
    total = agg["total"] or 0
    positive = agg["positive"] or 0
    negative = agg["negative"] or 0
    avg_rating = float(agg["avg_rating"] or 0)
    distinct_products = agg["distinct_products"] or 0

    # توزیع ستاره
    dist_rows = base.values("star").annotate(cnt=Count("id")).order_by()
    dist_map = {int(r["star"]): r["cnt"] for r in dist_rows if r["star"] is not None}
    rating_distribution = []
    for star in [5, 4, 3, 2, 1]:
        cnt = dist_map.get(star, 0)
        rating_distribution.append({
            "stars": f"{star} ستاره",
            "count": cnt,
            "percentage": round(cnt / total * 100, 1) if total else 0,
            "color": "#10B981" if star >= 4 else ("#FBBF24" if star == 3 else "#EF4444"),
        })

    # صفحه‌ی فعلی
    qs = base.select_related("product").order_by("-id")
    if cursor is not None:
        qs = qs.filter(id__lt=cursor)
    rows = list(qs[: limit + 1])
    has_next = len(rows) > limit
    rows = rows[:limit]

    return {
        "metrics": {
            "total_comments": total,
            "positive_comments": positive,
            "negative_comments": negative,
            "positive_rate": round(positive / total * 100, 1) if total else 0,
            "negative_rate": round(negative / total * 100, 1) if total else 0,
            "average_rating": round(avg_rating, 2),
            "avg_comments_per_product": round(total / distinct_products, 1) if distinct_products else 0,
            "change_rate": "—",
        },
        "ratingDistribution": rating_distribution,
        "comments": [_serialize(c) for c in rows],
        "totalCount": total,
        "limit": limit,
        "next_cursor": rows[-1].id if has_next and rows else None,
        "has_next": has_next,
    }


from django.core.cache import cache


def get_comments_cached(**kwargs):
    raw = json.dumps(kwargs, sort_keys=True, default=str)
    key = "comments:" + hashlib.md5(raw.encode()).hexdigest()

    data = cache.get(key)
    if data is None:
        data = get_comments(**kwargs)
        cache.set(key, data, 120)  # ۱۲۰ ثانیه، مثل timed_cache قبلی
    return data