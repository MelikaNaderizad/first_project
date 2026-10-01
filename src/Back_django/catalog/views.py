from django.http import JsonResponse
from .models import Products


def products(request):
    limit = int(request.GET.get("limit", 20))

    rows = Products.objects.order_by("-id")[:limit].values(
        "id", "title_fa", "brand", "category1", "price", "rate", "rate_cnt"
    )

    return JsonResponse({
        "products": list(rows),
        "limit": limit,
    })