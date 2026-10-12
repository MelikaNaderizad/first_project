from decimal import Decimal, InvalidOperation

from django.db.models import Avg, Count, OuterRef, Q, Subquery

from config.utils import decode_cursor, encode_cursor
from reviews.models import Comment

from .models import SellerKpi

STATUS_RECOMMENDATION = {
    "successful": "این فروشنده عملکرد پایداری دارد و ریسک پایینی برای مشتریان ایجاد می‌کند.",
    "unsuccessful": "این فروشنده نیازمند بررسی فوری از نظر اصالت کالا و نرخ مرجوعی است.",
    "neutral": "عملکرد این فروشنده در محدوده متوسط قرار دارد.",
    "insufficient_data": "داده کافی برای ارزیابی این فروشنده وجود ندارد.",
}

SORTS = {
    "health_desc": "seller_health_score",
    "satisfaction_desc": "customer_satisfaction_score",
    "comments_desc": "total_comments",
    "products_desc": "sold_products",
}
DEFAULT_SORT = "health_desc"

COMPARISON_METRICS = [
    ("رضایت مشتریان", "customer_satisfaction_score", "%"),
    ("امتیاز سلامت فروشنده", "seller_health_score", "از ۱۰۰"),
    ("نرخ کالای غیراصل / فیک", "fake_product_percent", "%"),
    ("محصولات کم‌امتیاز", "low_rated_product_percent", "%"),
]


def _grade_from_score(score):
    if score >= 90:
        return "A+"
    if score >= 75:
        return "A"
    if score >= 60:
        return "B"
    if score >= 40:
        return "C"
    return "D"


def _risk_level(fake, low_rated):
    if fake >= 25 or low_rated >= 40:
        return "critical"
    if fake >= 10 or low_rated >= 20:
        return "high"
    if fake >= 3 or low_rated >= 10:
        return "medium"
    return "low"


# دسته‌بندی غالب هر فروشنده (بیشترین کامنت) به‌صورت Subquery
_dominant_category = (
    Comment.objects.filter(
        seller_code=OuterRef("seller_code"),
        product__category1__isnull=False,
    )
    .values("product__category1")
    .annotate(cnt=Count("id"))
    .order_by("-cnt", "product__category1")
    .values("product__category1")[:1]
)


def _filters(status, category, search):
    q = Q()
    if status and status != "all":
        q &= Q(seller_status=status)
    if category and category != "all":
        q &= Q(category=category)
    if search:
        q &= Q(seller_title__icontains=search) | Q(seller_code__icontains=search)
    return q


def _decode_numeric_cursor(cursor):
    decoded = decode_cursor(cursor)
    if not decoded:
        return None
    try:
        return Decimal(str(decoded["value"])), str(decoded["id"])
    except (KeyError, TypeError, ValueError, InvalidOperation):
        return None


def _serialize(s):
    health = float(s.seller_health_score or 0)
    fake = float(s.fake_product_percent or 0)
    low_rated = float(s.low_rated_product_percent or 0)
    return {
        "seller_code": s.seller_code,
        "seller_title": s.seller_title or "نامشخص",
        "grade": _grade_from_score(health),
        "city": "نامشخص",
        "category": s.category or "",
        "sold_products": int(s.sold_products or 0),
        "total_comments": int(s.total_comments or 0),
        "positive_comments": int(s.positive_comments or 0),
        "negative_comments": int(s.negative_comments or 0),
        "customer_satisfaction_score": float(s.customer_satisfaction_score or 0),
        "fake_product_percent": fake,
        "low_rated_product_percent": low_rated,
        "seller_health_score": health,
        "seller_status": s.seller_status,
        "timely_shipping_rate": 0,
        "return_rate": 0,
        "commitment_score": 0,
        "radar_metrics": [],
        "risk_level": _risk_level(fake, low_rated),
        "recommendation": STATUS_RECOMMENDATION.get(s.seller_status, ""),
    }


def get_sellers(cursor=None, limit=20, status=None, category=None,
                search=None, sort=None):
    sort_key = sort if sort in SORTS else DEFAULT_SORT
    sort_field = SORTS[sort_key]

    filtered = SellerKpi.objects.annotate(
        category=Subquery(_dominant_category)
    ).filter(_filters(status, category, search))

    total = filtered.count()
    agg = filtered.aggregate(
        avg_sat=Avg("customer_satisfaction_score"),
        successful=Count("seller_code", filter=Q(seller_status="successful")),
        unsuccessful=Count("seller_code", filter=Q(seller_status="unsuccessful")),
    )

    qs = filtered
    decoded = _decode_numeric_cursor(cursor)
    if decoded:
        value, last_code = decoded
        qs = qs.filter(
            Q(**{f"{sort_field}__lt": value})
            | Q(**{sort_field: value}, seller_code__lt=last_code)
        )
    qs = qs.order_by(f"-{sort_field}", "-seller_code")

    rows = list(qs[: limit + 1])
    has_next = len(rows) > limit
    rows = rows[:limit]

    next_cursor = None
    if has_next and rows:
        last = rows[-1]
        next_cursor = encode_cursor(getattr(last, sort_field), last.seller_code)

    avg_sat = round(float(agg["avg_sat"] or 0), 1)

    # مقایسه‌ی موفق/ناموفق: یک کوئری به‌جای هشت‌تا
    exprs = {}
    for i, (_, field, _) in enumerate(COMPARISON_METRICS):
        exprs[f"s{i}"] = Avg(field, filter=Q(seller_status="successful"))
        exprs[f"u{i}"] = Avg(field, filter=Q(seller_status="unsuccessful"))
    cmp_row = SellerKpi.objects.aggregate(**exprs)

    performance_comparison = [
        {
            "metric": label,
            "successful": round(float(cmp_row[f"s{i}"] or 0), 1),
            "unsuccessful": round(float(cmp_row[f"u{i}"] or 0), 1),
            "unit": unit,
        }
        for i, (label, _, unit) in enumerate(COMPARISON_METRICS)
    ]

    return {
        "metrics": {
            "total_sellers": total,
            "successful_sellers": agg["successful"] or 0,
            "unsuccessful_sellers": agg["unsuccessful"] or 0,
            "avg_seller_rating": round(avg_sat / 20, 2) if avg_sat else 0,
            "avg_satisfaction_score": avg_sat,
        },
        "performanceComparison": performance_comparison,
        "sellers": [_serialize(s) for s in rows],
        "totalCount": total,
        "limit": limit,
        "next_cursor": next_cursor,
        "has_next": has_next,
    }