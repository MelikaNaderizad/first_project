from fastapi import APIRouter, Query

from services.comment_service import (
    get_comments,
    get_comments_summary
)


router = APIRouter(
    prefix="/api",
    tags=["Comments"]
)


@router.get("/comments")
def comments(
    page: int = Query(1, ge=1),
    page_size: int = Query(21, ge=1, le=100),
):
    return get_comments(page, page_size)


@router.get("/comments-summary")
def comments_summary():
    return get_comments_summary()