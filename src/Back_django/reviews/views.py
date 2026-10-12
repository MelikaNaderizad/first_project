from django.http import JsonResponse

from .services import get_comments_cached


def comment_list(request):
    p = request.GET
    try:
        limit = max(1, min(int(p.get("limit", 20)), 100))
        cursor = int(p["cursor"]) if p.get("cursor") else None
    except ValueError:
        return JsonResponse({"detail": "limit/cursor نامعتبر"}, status=422)

    data = get_comments_cached(
        cursor=cursor,
        limit=limit,
        sentiment=p.get("sentiment"),
        rating=p.get("rating"),
        category=p.get("category"),
        search=p.get("search"),
    )
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})