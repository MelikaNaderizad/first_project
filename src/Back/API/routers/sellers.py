from typing import Optional

from fastapi import APIRouter, Query

from services.seller_service import get_sellers


router = APIRouter(
    prefix="/api",
    tags=["Sellers"]
)


@router.get("/sellers")
def sellers(
    limit: Optional[int] = Query(
        None,
        ge=1,
        le=20000
    )
):
    return get_sellers(limit)