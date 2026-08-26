from typing import Optional

from fastapi import APIRouter, Query

from services.comments_services import get_comments


router = APIRouter(
    prefix="/api",
    tags=["Comments"]
)


@router.get("/comments")
def comments(
    page: int = Query(1, ge=1),
    page_size: int = Query(21, ge=1, le=100),
    sentiment: Optional[str] = Query(None),
    rating: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    return get_comments(
        page=page,
        page_size=page_size,
        sentiment=sentiment,
        rating=rating,
        category=category,
        search=search,
    )