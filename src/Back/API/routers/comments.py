from fastapi import APIRouter, Query

from services.comments_services import (
    get_comments,
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
