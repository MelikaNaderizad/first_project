from django.db.models import Avg, Count, F, Q
from decimal import Decimal, InvalidOperation

from config.utils import decode_cursor, encode_cursor

from .models import Products

SORTS = {
    "rate_desc": "raw_product_rate",
    "rate_cnt_desc": "rate_cnt",
    "bayesian_desc": "bayesian_product_score",
    "health_desc": "product_health_score",
}
DEFAULT_SORT = "rate_desc"

SUCCESSFUL = Q(kpi__product_status="successful")
UNSUCCESSFUL = Q(kpi__product_status="unsuccessful")


def _filters(status, category, search):
    q = Q()
    if status and status != "all":
        q &= Q(kpi__product_status=status)
    if category and category != "all":
        q &= Q(category1=category)
    if search:
        q &= (
            Q(title_fa__icontains=search)
            | Q(brand__icontains=search)
            | Q(seller__icontains=search)
            | Q(sub_category__icontains=search)
        )
    return q


def _decode_numeric_cursor(cursor):
    decoded = decode_cursor(cursor)
    if not decoded:
        return None
    try:
        return Decimal(str(decoded["value"])), int(decoded["id"])
    except (KeyError, TypeError, ValueError, InvalidOperation):
        return None


def _serialize(p):
    kpi = getattr(p, "kpi", None)  # اگر KPI نداشت None می‌شود
    return {
        "id": str(p.id),
        "product_id": str(p.id),
        "title_fa": p.title_fa,
        "category1": p.category1 or "عمومی",
        "sub_category": p.sub_category or "",
        "brand": p.brand or "متفرقه",
        "seller": p.seller or "نامشخص",
        "seller_code": None,
        "is_fake": bool(p.is_fake),
        "price": p.price or 0,
        "min_price_last_month": p.min_price_last_month or p.price or 0,
        "rate": round((p.rate or 0) / 20, 1),
        "raw_product_rate": round((p.rate or 0) / 20, 1),
        "rate_cnt": p.rate_cnt or 0,
        "positive_comments": int(kpi.positive_comments or 0) if kpi else 0,
        "negative_comments": int(kpi.negative_comments or 0) if kpi else 0,
        "bayesian_product_score": float(kpi.bayesian_product_score or 0) if kpi else 0,
        "sentiment_score": float(kpi.sentiment_score or 0) if kpi else 0,
        "product_health_score": float(kpi.product_health_score or 0) if kpi else 0,
        "product_status": kpi.product_status if kpi else "insufficient_data",
    }


def get_products(cursor=None, limit=20, status=None, category=None,
                 search=None, sort=None):
    sort_key = sort if sort in SORTS else DEFAULT_SORT
    sort_field = SORTS[sort_key]
    sort_path = f"kpi__{sort_field}"

    filtered = Products.objects.filter(_filters(status, category, search))

    # شمارش و متریک‌ها
    total = filtered.count()
    agg = filtered.aggregate(
        successful=Count("id", filter=SUCCESSFUL),
        unsuccessful=Count("id", filter=UNSUCCESSFUL),
        avg_rate_raw=Avg("kpi__raw_product_rate"),
    )

    # کالاهای فیک (status در این شمارش اثر ندارد، مثل FastAPI)
    fake_count = (
        Products.objects.filter(_filters(None, category, search), is_fake=True).count()
    )

    # تفکیک دسته‌بندی (۴ دسته‌ی اول)
    categories = (
        filtered.filter(category1__isnull=False)
        .values("category1")
        .annotate(
            total=Count("id"),
            successful=Count("id", filter=SUCCESSFUL),
            unsuccessful=Count("id", filter=UNSUCCESSFUL),
        )
        .order_by("-total")[:4]
    )

    # صفحه‌ی فعلی
    qs = filtered.select_related("kpi")
    decoded = _decode_numeric_cursor(cursor)
    if decoded:
        value, last_id = decoded
        qs = qs.filter(
            Q(**{f"{sort_path}__lt": value})
            | Q(**{sort_path: value}, id__lt=last_id)
        )
    qs = qs.order_by(F(sort_path).desc(nulls_last=True), "-id")

    rows = list(qs[: limit + 1])
    has_next = len(rows) > limit
    rows = rows[:limit]

    next_cursor = None
    if has_next and rows:
        last = rows[-1]
        kpi = getattr(last, "kpi", None)
        last_value = getattr(kpi, sort_field, None) if kpi else None
        if last_value is not None:
            next_cursor = encode_cursor(last_value, last.id)

    return {
        "metrics": {
            "total_products": total,
            "successful_products": agg["successful"] or 0,
            "unsuccessful_products": agg["unsuccessful"] or 0,
            "avg_rating": round(float(agg["avg_rate_raw"] or 0) / 20, 2),
            "fake_products_count": fake_count,
        },
        "categoryBreakdown": [
            {
                "name": c["category1"],
                "total": c["total"],
                "successful": c["successful"],
                "unsuccessful": c["unsuccessful"],
            }
            for c in categories
        ],
        "products": [_serialize(p) for p in rows],
        "totalCount": total,
        "limit": limit,
        "next_cursor": next_cursor,
        "has_next": has_next,
    }