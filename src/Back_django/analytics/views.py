from django.http import JsonResponse

from config.utils import cached_call

from .services import get_sellers
from .dashboard import get_dashboard_overview


def sellers(request):
    p = request.GET
    try:
        limit = max(1, min(int(p.get("limit", 20)), 100))
    except ValueError:
        return JsonResponse({"detail": "limit نامعتبر"}, status=422)

    data = cached_call(
        "sellers",
        300,
        get_sellers,
        cursor=p.get("cursor"),
        limit=limit,
        status=p.get("status"),
        category=p.get("category"),
        search=p.get("search"),
        sort=p.get("sort"),
    )
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})



def overview(request):
    data = cached_call("overview", 300, get_dashboard_overview)
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})

from .forecast import get_product_forecast, list_forecast_products


def forecast_products(request):
    try:
        limit = max(1, min(int(request.GET.get("limit", 20)), 100))
    except ValueError:
        return JsonResponse({"detail": "limit نامعتبر"}, status=422)

    data = cached_call(
        "forecast_list", 300, list_forecast_products,
        search=request.GET.get("search"), limit=limit,
    )
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})


def forecast_product(request, product_id):
    data = cached_call("forecast_one", 300, get_product_forecast, product_id=product_id)
    if data is None:
        return JsonResponse(
            {"detail": "برای این محصول پیش‌بینی موجود نیست"},
            status=404,
            json_dumps_params={"ensure_ascii": False},
        )
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})