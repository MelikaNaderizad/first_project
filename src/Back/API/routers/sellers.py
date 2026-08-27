from typing import Optional

from fastapi import APIRouter, Query

from services.sellers_services import get_sellers


router = APIRouter(
    prefix="/api",
    tags=["Sellers"]
)


@router.get("/sellers")
def sellers(
    cursor: Optional[str] = Query(
        None,
        description="Cursor آخرین فروشنده صفحه قبلی"
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100
    ),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
):
    return get_sellers(
        cursor=cursor,
        limit=limit,
        status=status,
        category=category,
        search=search,
        sort=sort,
    )