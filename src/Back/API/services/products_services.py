import sys
from pathlib import Path
from typing import Optional

BACK_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BACK_DIR))

from sqlalchemy import select, func, or_, and_, case
from sqlalchemy.orm import Session

from database.conn import engine
from database.models import Products
from database.kpi_views import ProductKpiView
from services.cache import timed_cache
from services.cursor import encode_cursor, decode_cursor


SORT_COLUMNS = {
    "rate_desc": ProductKpiView.raw_product_rate,
    "rate_cnt_desc": ProductKpiView.rate_cnt,
    "bayesian_desc": ProductKpiView.bayesian_product_score,
    "health_desc": ProductKpiView.product_health_score,
}

DEFAULT_SORT = "rate_desc"


def _apply_filters(stmt, status=None, category=None, search=None):
    if status and status != "all":
        stmt = stmt.where(ProductKpiView.product_status == status)

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


def _decode_numeric_cursor(cursor: Optional[str]):
    """کرسر را به (مقدار عددی، id محصول) دیکد می‌کند. اگر نامعتبر بود None برمی‌گرداند."""
    decoded = decode_cursor(cursor)
    if decoded is None:
        return None

    raw_value = decoded.get("value")
    raw_id = decoded.get("id")

    if raw_value is None or raw_id is None:
        return None

    try:
        cursor_value = float(raw_value)
        cursor_id = int(raw_id)
    except (TypeError, ValueError):
        return None

    return cursor_value, cursor_id


@timed_cache(ttl_seconds=300)
def get_products(
    cursor: Optional[str] = None,
    limit: int = 20,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
):
    sort_key = sort if sort in SORT_COLUMNS else DEFAULT_SORT
    sort_col = SORT_COLUMNS[sort_key]

    with Session(engine) as session:

        base_stmt = (
            select(ProductKpiView, Products)
            .select_from(ProductKpiView)
            .join(Products, Products.id == ProductKpiView.product_id)
        )
        base_stmt = _apply_filters(base_stmt, status, category, search)

        # ---- شمارش کل ----
        count_stmt = (
            select(func.count())
            .select_from(ProductKpiView)
            .join(Products, Products.id == ProductKpiView.product_id)
        )
        count_stmt = _apply_filters(count_stmt, status, category, search)
        total_products = session.execute(count_stmt).scalar() or 0

        # ---- keyset (cursor) pagination ----
        decoded_cursor = _decode_numeric_cursor(cursor)
        if decoded_cursor is not None:
            cursor_value, cursor_id = decoded_cursor
            base_stmt = base_stmt.where(
                or_(
                    sort_col < cursor_value,
                    and_(sort_col == cursor_value, ProductKpiView.product_id < cursor_id),
                )
            )

        list_stmt = (
            base_stmt
            .order_by(sort_col.desc(), ProductKpiView.product_id.desc())
            .limit(limit + 1)
        )

        rows = session.execute(list_stmt).all()

        has_next = len(rows) > limit
        if has_next:
            rows = rows[:limit]

        results = []
        for kpi, product in rows:
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
                "positive_comments": int(kpi.positive_comments or 0),
                "negative_comments": int(kpi.negative_comments or 0),
                "bayesian_product_score": float(kpi.bayesian_product_score or 0),
                "sentiment_score": float(kpi.sentiment_score or 0),
                "product_health_score": float(kpi.product_health_score or 0),
                "product_status": kpi.product_status,
            })

        next_cursor = None
        if has_next and rows:
            last_kpi, last_product = rows[-1]
            last_sort_value = getattr(last_kpi, sort_col.key)
            next_cursor = encode_cursor(last_sort_value, last_product.id)

        # ---- متریک‌های تجمیعی ----
        agg_stmt = (
            select(
                func.count().label("total"),
                func.coalesce(
                    func.sum(case((ProductKpiView.product_status == "successful", 1), else_=0)), 0
                ).label("successful"),
                func.coalesce(
                    func.sum(case((ProductKpiView.product_status == "unsuccessful", 1), else_=0)), 0
                ).label("unsuccessful"),
                func.coalesce(func.avg(ProductKpiView.raw_product_rate), 0).label("avg_rate_raw"),
            )
            .select_from(ProductKpiView)
            .join(Products, Products.id == ProductKpiView.product_id)
        )
        agg_stmt = _apply_filters(agg_stmt, status, category, search)
        agg = session.execute(agg_stmt).mappings().first()

        successful_products = int(agg["successful"] or 0)
        unsuccessful_products = int(agg["unsuccessful"] or 0)
        avg_rating = round(float(agg["avg_rate_raw"] or 0) / 20, 2)

        # ---- کالاهای فیک ----
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

        # ---- تفکیک دسته‌بندی ----
        cat_stmt = (
            select(
                Products.category1.label("name"),
                func.count().label("total"),
                func.coalesce(
                    func.sum(case((ProductKpiView.product_status == "successful", 1), else_=0)), 0
                ).label("successful"),
                func.coalesce(
                    func.sum(case((ProductKpiView.product_status == "unsuccessful", 1), else_=0)), 0
                ).label("unsuccessful"),
            )
            .select_from(ProductKpiView)
            .join(Products, Products.id == ProductKpiView.product_id)
            .where(Products.category1.isnot(None))
        )
        cat_stmt = _apply_filters(cat_stmt, status, category, search)
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
            "total_products": int(total_products),
            "successful_products": successful_products,
            "unsuccessful_products": unsuccessful_products,
            "avg_rating": avg_rating,
            "fake_products_count": int(fake_products_count),
        },
        "categoryBreakdown": category_breakdown,
        "products": results,
        "totalCount": int(total_products),
        "limit": limit,
        "next_cursor": next_cursor,
        "has_next": has_next,
    }