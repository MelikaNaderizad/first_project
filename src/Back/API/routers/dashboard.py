from fastapi import APIRouter
from services.dashboard_services import get_dashboard_overview


router = APIRouter(
    prefix="/api",
    tags=["Dashboard"]
)


@router.get("/overview")
def overview():
    return get_dashboard_overview()