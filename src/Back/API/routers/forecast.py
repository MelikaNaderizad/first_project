from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from services.forecast_services import list_forecast_products, get_product_forecast

router = APIRouter(prefix="/api", tags=["Forecast"])


@router.get("/forecast/products")
def forecast_products(
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
):
    return list_forecast_products(search=search, limit=limit)


@router.get("/forecast/products/{product_id}")
def forecast_product(product_id: int):
    data = get_product_forecast(product_id)
    if data is None:
        raise HTTPException(status_code=404, detail="برای این محصول پیش‌بینی موجود نیست")
    return data