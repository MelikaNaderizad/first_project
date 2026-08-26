import time
import threading
from functools import wraps

_cache_store = {}
_lock = threading.Lock()


def timed_cache(ttl_seconds: int = 300):
    """کش ساده در حافظه با زمان انقضا (TTL)."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (func.__module__, func.__name__, args, tuple(sorted(kwargs.items())))
            now = time.time()

            with _lock:
                cached = _cache_store.get(key)
                if cached and (now - cached["time"]) < ttl_seconds:
                    return cached["value"]

            result = func(*args, **kwargs)

            with _lock:
                _cache_store[key] = {"value": result, "time": now}

            return result
        return wrapper
    return decorator


def clear_cache():
    with _lock:
        _cache_store.clear()