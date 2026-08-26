from typing import Optional

from fastapi import APIRouter, Query

from services.products_services import get_products


router = APIRouter(
    prefix="/api",
    tags=["Products"]
)


@router.get("/products")
def products(
    page: int = Query(
        1,
        ge=1
    ),

    page_size: int = Query(
        50,
        ge=1,
        le=100
    ),

    status: Optional[str] = Query(None),

    category: Optional[str] = Query(None),

    search: Optional[str] = Query(None),

    sort: Optional[str] = Query(None),
):

    return get_products(
        page=page,
        page_size=page_size,
        status=status,
        category=category,
        search=search,
        sort=sort,
    )