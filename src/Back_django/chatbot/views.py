import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


def _json(data, status=200):
    return JsonResponse(data, status=status, json_dumps_params={"ensure_ascii": False})


def chatbot_status(request):
    return _json({
        "status": "not_ready",
        "message": "دستیار هوشمند (AI Agent) هنوز پیاده‌سازی نشده و به‌زودی فعال خواهد شد.",
    })


@csrf_exempt
@require_POST
def chatbot_message(request):
    try:
        message = json.loads(request.body or "{}").get("message")
    except (json.JSONDecodeError, AttributeError):
        message = None

    if not isinstance(message, str):
        return _json({"detail": "فیلد message الزامی است"}, status=422)

    return _json({
        "status": "not_ready",
        "reply": "این قابلیت هنوز آماده نیست. لطفاً بعداً دوباره تلاش کنید.",
        "received_message": message,
    })