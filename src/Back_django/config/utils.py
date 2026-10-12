import base64
import hashlib
import json

from django.core.cache import cache


def encode_cursor(value, item_id):
    raw = json.dumps(
        {"value": value, "id": item_id},
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    ).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def decode_cursor(cursor):
    if not cursor:
        return None
    try:
        raw = base64.urlsafe_b64decode(cursor.encode("utf-8"))
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return None


def cached_call(prefix, ttl, func, **kwargs):
    """معادل timed_cache در FastAPI."""
    raw = json.dumps(kwargs, sort_keys=True, default=str)
    key = f"{prefix}:{hashlib.md5(raw.encode()).hexdigest()}"
    data = cache.get(key)
    if data is None:
        data = func(**kwargs)
        cache.set(key, data, ttl)
    return data