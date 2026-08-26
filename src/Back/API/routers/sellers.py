from typing import Optional

from fastapi import APIRouter, Query

from services.sellers_services import get_sellers


router = APIRouter(
    prefix="/api",
    tags=["Sellers"]
)


@router.get("/sellers")
def sellers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),

    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
):
    return get_sellers(
        page=page,
        page_size=page_size,
        status=status,
        category=category,
        search=search,
        sort=sort,
    )