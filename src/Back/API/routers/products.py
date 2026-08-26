from typing import Optional

from fastapi import APIRouter, Query

from services.products_services import get_products


router = APIRouter(
    prefix="/api",
    tags=["Products"]
)


@router.get("/products")
def products(
    limit: Optional[int] = Query(None, ge=1, le=20000),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
):
    return get_products(
        limit=limit,
        status=status,
        category=category,
        search=search,
        sort=sort,
    )