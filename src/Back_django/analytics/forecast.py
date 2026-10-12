from django.db.models import F

from .models import ProductForecast


def list_forecast_products(search=None, limit=20):
    qs = ProductForecast.objects.select_related("product").order_by(
        F("total_comments").desc(nulls_last=True)
    )
    if search:
        qs = qs.filter(product__title_fa__icontains=search)

    return {
        "products": [
            {
                "id": str(f.product_id),
                "title_fa": f.product.title_fa,
                "brand": f.product.brand or "متفرقه",
                "category1": f.product.category1 or "عمومی",
                "total_comments": f.total_comments,
                "mae": f.mae,
                "baseline_mae": f.baseline_mae,
            }
            for f in qs[:limit]
        ]
    }


def get_product_forecast(product_id):
    f = (
        ProductForecast.objects.select_related("product")
        .filter(pk=product_id)
        .first()
    )
    if f is None:
        return None

    return {
        "product": {
            "id": str(product_id),
            "title_fa": f.product.title_fa,
            "brand": f.product.brand or "متفرقه",
            "category1": f.product.category1 or "عمومی",
        },
        **(f.payload or {}),
    }