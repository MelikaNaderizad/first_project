from typing import Optional

from fastapi import APIRouter, Query

from services.product_service import get_products


router = APIRouter(
    prefix="/api",
    tags=["Products"]
)


@router.get("/products")
def products(
    limit: Optional[int] = Query(
        None,
        ge=1,
        le=20000
    )
):
    return get_products(limit)