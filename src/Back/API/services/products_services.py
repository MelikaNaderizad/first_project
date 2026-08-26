import sys
from pathlib import Path
from typing import Optional

BACK_DIR = Path(__file__).resolve().parent.parent.parent
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy import select, func, or_, case
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Products

from queries.products_kpi_queries import product_kpi_query
from services.cache import timed_cache


STATUS_RECOMMENDATION = {
    "successful": "این کالا عملکرد و رضایت بالایی دارد و کاندید مناسبی برای پروموشن است.",
    "unsuccessful": "این کالا نیازمند بررسی کیفیت، اصالت یا شرایط فروشنده است.",
    "neutral": "وضعیت این کالا متوسط است و نیاز به پایش بیشتر دارد.",
    "insufficient_data": "داده کافی برای ارزیابی دقیق این کالا وجود ندارد.",
}

SORT_COLUMNS = {
    "rate_desc": "raw_product_rate",
    "rate_cnt_desc": "rate_cnt",
    "bayesian_desc": "bayesian_product_score",
    "health_desc": "product_health_score",
}


def _apply_filters(stmt, kpi_sub, status=None, category=None, search=None):
    if status and status != "all":
        stmt = stmt.where(kpi_sub.c.product_status == status)
    if category and category != "all":
        stmt = stmt.where(Products.category1 == category)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(
                Products.title_fa.ilike(like),
                Products.brand.ilike(like),
                Products.seller.ilike(like),
                Products.sub_category.ilike(like),
            )
        )
    return stmt


@timed_cache(ttl_seconds=300)
def get_products(
    limit: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
):
    with Session(engine) as session:
        kpi_sub = product_kpi_query.subquery()

        # ---- لیست محصولات صفحه فعلی ----
        list_stmt = (
            select(kpi_sub)
            .select_from(kpi_sub)
            .join(Products, Products.id == kpi_sub.c.product_id)
        )
        list_stmt = _apply_filters(list_stmt, kpi_sub, status, category, search)

        sort_col_name = SORT_COLUMNS.get(sort, "raw_product_rate")
        sort_col = getattr(kpi_sub.c, sort_col_name)
        list_stmt = list_stmt.order_by(sort_col.desc()).limit(limit or 500)

        kpi_rows = session.execute(list_stmt).mappings().all()

        product_ids = [row["product_id"] for row in kpi_rows]
        products_by_id = {}
        if product_ids:
            products_by_id = {
                p.id: p
                for p in session.query(Products).filter(Products.id.in_(product_ids)).all()
            }

        results = []
        for row in kpi_rows:
            product = products_by_id.get(row["product_id"])
            if not product:
                continue
            results.append({
                "id": str(product.id),
                "product_id": str(product.id),
                "title_fa": product.title_fa,
                "category1": product.category1 or "عمومی",
                "sub_category": product.sub_category or "",
                "brand": product.brand or "متفرقه",
                "seller": product.seller or "نامشخص",
                "seller_code": None,
                "is_fake": bool(product.is_fake),
                "price": product.price or 0,
                "min_price_last_month": product.min_price_last_month or product.price or 0,
                "rate": round((product.rate or 0) / 20, 1),
                "raw_product_rate": round((product.rate or 0) / 20, 1),
                "rate_cnt": product.rate_cnt or 0,
                "positive_comments": int(row["positive_comments"] or 0),
                "negative_comments": int(row["negative_comments"] or 0),
                "bayesian_product_score": float(row["bayesian_product_score"] or 0),
                "sentiment_score": float(row["sentiment_score"] or 0),
                "product_health_score": float(row["product_health_score"] or 0),
                "product_status": row["product_status"],
            })

        # ---- متریک‌های واقعی (روی کل مجموعهٔ فیلترشده، بدون لیمیت) ----
        agg_stmt = (
            select(
                func.count().label("total"),
                func.coalesce(
                    func.sum(case((kpi_sub.c.product_status == "successful", 1), else_=0)), 0
                ).label("successful"),
                func.coalesce(
                    func.sum(case((kpi_sub.c.product_status == "unsuccessful", 1), else_=0)), 0
                ).label("unsuccessful"),
                func.coalesce(func.avg(kpi_sub.c.raw_product_rate), 0).label("avg_rate_raw"),
            )
            .select_from(kpi_sub)
            .join(Products, Products.id == kpi_sub.c.product_id)
        )
        agg_stmt = _apply_filters(agg_stmt, kpi_sub, status, category, search)
        agg = session.execute(agg_stmt).mappings().first()

        total_products = int(agg["total"] or 0)
        successful_products = int(agg["successful"] or 0)
        unsuccessful_products = int(agg["unsuccessful"] or 0)
        avg_rating = round(float(agg["avg_rate_raw"] or 0) / 20, 2)

        # توجه: product_kpi_query کالاهای is_fake رو از محاسبهٔ امتیاز حذف می‌کنه،
        # پس شمارش فیک‌ها رو مستقیم و مستقل از روی جدول Products می‌زنیم
        fake_stmt = select(func.count()).select_from(Products).where(Products.is_fake == True)
        if category and category != "all":
            fake_stmt = fake_stmt.where(Products.category1 == category)
        if search:
            like = f"%{search}%"
            fake_stmt = fake_stmt.where(
                or_(
                    Products.title_fa.ilike(like),
                    Products.brand.ilike(like),
                    Products.seller.ilike(like),
                    Products.sub_category.ilike(like),
                )
            )
        fake_products_count = session.execute(fake_stmt).scalar() or 0

        # ---- تفکیک دسته‌بندی (۴ دسته پرحجم‌تر، در مجموعه فیلترشده) ----
        cat_stmt = (
            select(
                Products.category1.label("name"),
                func.count().label("total"),
                func.coalesce(
                    func.sum(case((kpi_sub.c.product_status == "successful", 1), else_=0)), 0
                ).label("successful"),
                func.coalesce(
                    func.sum(case((kpi_sub.c.product_status == "unsuccessful", 1), else_=0)), 0
                ).label("unsuccessful"),
            )
            .select_from(kpi_sub)
            .join(Products, Products.id == kpi_sub.c.product_id)
            .where(Products.category1.isnot(None))
        )
        cat_stmt = _apply_filters(cat_stmt, kpi_sub, status, category, search)
        cat_stmt = cat_stmt.group_by(Products.category1).order_by(func.count().desc()).limit(4)

        category_breakdown = [
            {
                "name": row["name"],
                "total": int(row["total"] or 0),
                "successful": int(row["successful"] or 0),
                "unsuccessful": int(row["unsuccessful"] or 0),
            }
            for row in session.execute(cat_stmt).mappings().all()
        ]

    return {
        "metrics": {
            "total_products": total_products,
            "successful_products": successful_products,
            "unsuccessful_products": unsuccessful_products,
            "avg_rating": avg_rating,
            "fake_products_count": int(fake_products_count or 0),
        },
        "categoryBreakdown": category_breakdown,
        "products": results,
    }