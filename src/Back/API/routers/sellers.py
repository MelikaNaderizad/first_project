from typing import Optional

from fastapi import APIRouter, Query

from services.sellers_services import get_sellers


router = APIRouter(
    prefix="/api",
    tags=["Sellers"]
)


@router.get("/sellers")
def sellers(
    limit: Optional[int] = Query(None, ge=1, le=20000),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
):
    return get_sellers(
        limit=limit,
        status=status,
        category=category,
        search=search,
        sort=sort,
    )