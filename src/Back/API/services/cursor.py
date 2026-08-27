import base64
import json
from typing import Any, Optional


def encode_cursor(value: Any, item_id: Any) -> str:
    payload = {
        "value": value,
        "id": item_id,
    }

    raw = json.dumps(
        payload,
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    ).encode("utf-8")

    return base64.urlsafe_b64encode(raw).decode("utf-8")


def decode_cursor(cursor: Optional[str]):
    if not cursor:
        return None

    try:
        raw = base64.urlsafe_b64decode(
            cursor.encode("utf-8")
        )

        payload = json.loads(
            raw.decode("utf-8")
        )

        return payload

    except Exception:
        return None