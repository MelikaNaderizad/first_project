from django.http import JsonResponse

from config.utils import cached_call

from .services import get_products


def products(request):
    p = request.GET
    try:
        limit = max(1, min(int(p.get("limit", 20)), 100))
    except ValueError:
        return JsonResponse({"detail": "limit نامعتبر"}, status=422)

    data = cached_call(
        "products",
        300,
        get_products,
        cursor=p.get("cursor"),
        limit=limit,
        status=p.get("status"),
        category=p.get("category"),
        search=p.get("search"),
        sort=p.get("sort"),
    )
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})