from typing import Optional

from fastapi import APIRouter, Query

from services.comments_services import get_comments


router = APIRouter(
    prefix="/api",
    tags=["Comments"]
)


@router.get("/comments")
def comments(
    cursor: Optional[int] = Query(
        None,
        description="ID آخرین کامنت صفحه قبلی"
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100
    ),
    sentiment: Optional[str] = Query(None),
    rating: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    return get_comments(
        cursor=cursor,
        limit=limit,
        sentiment=sentiment,
        rating=rating,
        category=category,
        search=search,
    )