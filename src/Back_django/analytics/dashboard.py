from django.db.models import (
    Avg, Case, CharField, Count, F, Func, IntegerField, Q, Value, When,
)

from catalog.models import Products
from reviews.models import Comment
from reviews.services import NEGATIVE, POSITIVE
from reviews.services import _serialize as serialize_comment

from .models import ProductKpi, SellerKpi

PERSIAN_MONTH_ORDER = {
    "فروردین": 1, "اردیبهشت": 2, "خرداد": 3, "تیر": 4, "مرداد": 5, "شهریور": 6,
    "مهر": 7, "آبان": 8, "آذر": 9, "دی": 10, "بهمن": 11, "اسفند": 12,
}


def _pct(part, whole):
    return round(part / whole * 100, 1) if whole else 0


def _sentiment_timeline():
    # "26 مهر 1402" ← کلمه‌ی دوم = ماه
    month = Func(
        F("created_at"), Value(" "), Value(2),
        function="split_part", output_field=CharField(),
    )
    order_idx = Case(
        *[When(month=name, then=Value(i)) for name, i in PERSIAN_MONTH_ORDER.items()],
        default=Value(0),
        output_field=IntegerField(),
    )
    rows = (
        Comment.objects.annotate(month=month)
        .filter(month__gt="")  # ماه خالی/null حذف شود
        .annotate(order_idx=order_idx)
        .values("month", "order_idx")
        .annotate(
            positive=Count("id", filter=POSITIVE),
            negative=Count("id", filter=NEGATIVE),
            total=Count("id"),
        )
        .order_by("order_idx")[:6]
    )
    return [
        {
            "month": r["month"],
            "positive": r["positive"],
            "negative": r["negative"],
            "neutral": max(r["total"] - r["positive"] - r["negative"], 0),
            "total": r["total"],
        }
        for r in rows
    ]


def _category_distribution():
    rows = (
        Comment.objects.filter(product__category1__isnull=False)
        .values("product__category1")
        .annotate(
            total=Count("id"),
            positive=Count("id", filter=POSITIVE),
            negative=Count("id", filter=NEGATIVE),
        )
        .order_by("-total")[:4]
    )
    return [
        {
            "category": r["product__category1"],
            "total": r["total"],
            "positive": r["positive"],
            "negative": r["negative"],
            "positivePercentage": _pct(r["positive"], r["total"]),
            "negativePercentage": _pct(r["negative"], r["total"]),
        }
        for r in rows
    ]


def _seller_item(s):
    if not s:
        return {}
    return {
        "seller_code": s.seller_code,
        "seller_title": s.seller_title or "نامشخص",
        "sold_products": int(s.sold_products or 0),
        "total_comments": int(s.total_comments or 0),
        "positive_comments": int(s.positive_comments or 0),
        "negative_comments": int(s.negative_comments or 0),
        "customer_satisfaction_score": float(s.customer_satisfaction_score or 0),
        "fake_product_percent": float(s.fake_product_percent or 0),
        "low_rated_product_percent": float(s.low_rated_product_percent or 0),
        "seller_health_score": float(s.seller_health_score or 0),
        "seller_status": s.seller_status,
    }


def _product_item(p):
    if not p:
        return {}
    rate = round(float(p.raw_product_rate or 0) / 20, 1)
    return {
        "id": str(p.product_id),
        "product_id": str(p.product_id),
        "title_fa": p.title_fa,
        "rate": rate,
        "raw_product_rate": rate,
        "rate_cnt": int(p.rate_cnt or 0),
        "positive_comments": int(p.positive_comments or 0),
        "negative_comments": int(p.negative_comments or 0),
        "bayesian_product_score": float(p.bayesian_product_score or 0),
        "sentiment_score": float(p.sentiment_score or 0),
        "product_health_score": float(p.product_health_score or 0),
        "product_status": p.product_status,
    }


def get_dashboard_overview():
    # کامنت‌ها: یک کوئری به‌جای سه‌تا
    c = Comment.objects.aggregate(
        total=Count("id"),
        positive=Count("id", filter=POSITIVE),
        negative=Count("id", filter=NEGATIVE),
        avg_rating=Avg("rate"),
    )
    total_comments = c["total"] or 0
    positive = c["positive"] or 0
    negative = c["negative"] or 0
    neutral = max(total_comments - positive - negative, 0)

    # محصولات و فروشنده‌ها (از ویوهای آماده)
    p = ProductKpi.objects.aggregate(
        successful=Count("pk", filter=Q(product_status="successful")),
        unsuccessful=Count("pk", filter=Q(product_status="unsuccessful")),
    )
    total_products = Products.objects.count()

    s = SellerKpi.objects.aggregate(
        total=Count("seller_code"),
        successful=Count("seller_code", filter=Q(seller_status="successful")),
        unsuccessful=Count("seller_code", filter=Q(seller_status="unsuccessful")),
    )

    kpis = {
        "total_comments": total_comments,
        "positive_comments": positive,
        "negative_comments": negative,
        "positive_percentage": _pct(positive, total_comments),
        "negative_percentage": _pct(negative, total_comments),
        "neutral_percentage": _pct(neutral, total_comments),
        "average_rating": round(float(c["avg_rating"] or 0), 2),
        "total_sellers": s["total"] or 0,
        "successful_sellers": s["successful"] or 0,
        "unsuccessful_sellers": s["unsuccessful"] or 0,
        "seller_success_rate": _pct(s["successful"] or 0, s["total"] or 0),
        "total_products": total_products,
        "successful_products": p["successful"] or 0,
        "unsuccessful_products": p["unsuccessful"] or 0,
        "product_success_rate": _pct(p["successful"] or 0, total_products),
    }

    sellers = SellerKpi.objects.filter(sold_products__gt=0)
    products = ProductKpi.objects.filter(rate_cnt__gt=0)

    recent = Comment.objects.select_related("product").order_by("-id")[:6]

    return {
        "kpis": kpis,
        "sentimentTimeline": _sentiment_timeline(),
        "categoryDistribution": _category_distribution(),
        "topSeller": _seller_item(
            sellers.order_by(F("seller_health_score").desc(nulls_last=True)).first()
        ),
        "weakestSeller": _seller_item(
            sellers.order_by(F("seller_health_score").asc(nulls_last=True)).first()
        ),
        "topProduct": _product_item(
            products.order_by(F("product_health_score").desc(nulls_last=True)).first()
        ),
        "weakestProduct": _product_item(
            products.order_by(F("product_health_score").asc(nulls_last=True)).first()
        ),
        "recentComments": [serialize_comment(c) for c in recent],
    }