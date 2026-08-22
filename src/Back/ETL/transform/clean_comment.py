import ast
import pandas as pd

NUMERIC_COLUMNS = ["rate", "true_to_size_rate"]
LIST_LIKE_COLUMNS = ["advantages", "disadvantages"]

# for changing data type
def coerce_types(chunk: pd.DataFrame) -> pd.DataFrame:
    for col in NUMERIC_COLUMNS:
        if col in chunk.columns:
            chunk[col] = pd.to_numeric(chunk[col], errors="coerce")
    return chunk



# checking rate
def validate_ranges(chunk: pd.DataFrame, stats: dict) -> pd.DataFrame:
    if "rate" in chunk.columns:
        invalid_rate = (chunk["rate"] < 0) | (chunk["rate"] > 5)
        stats["invalid_rate"] += int(invalid_rate.sum())
        chunk.loc[invalid_rate, "rate"] = pd.NA

    if "true_to_size_rate" in chunk.columns:
        invalid_ttsr = (chunk["true_to_size_rate"] < 0) | (chunk["true_to_size_rate"] > 5)
        stats["invalid_true_to_size_rate"] += int(invalid_ttsr.sum())
        chunk.loc[invalid_ttsr, "true_to_size_rate"] = pd.NA

    if "likes" in chunk.columns:
        invalid_likes = chunk["likes"] < 0
        stats["invalid_likes"] += int(invalid_likes.sum())
        chunk.loc[invalid_likes, "likes"] = pd.NA

    if "dislikes" in chunk.columns:
        invalid_dislikes = chunk["dislikes"] < 0
        stats["invalid_dislikes"] += int(invalid_dislikes.sum())
        chunk.loc[invalid_dislikes, "dislikes"] = pd.NA

    return chunk

# make it a list
def _normalize_list_value(value):
    if not isinstance(value, str) or not value.strip():
        return value
    stripped = value.strip()
    if stripped.startswith("[") and stripped.endswith("]"):
        try:
            # real list in python
            parsed = ast.literal_eval(stripped)
            if isinstance(parsed, list):
                items = [str(item).strip() for item in parsed if str(item).strip()]
                return "، ".join(items)
        except (ValueError, SyntaxError):
            return value
    return value


def normalize_list_columns(chunk: pd.DataFrame) -> pd.DataFrame:
    for col in LIST_LIKE_COLUMNS:
        if col in chunk.columns:
            chunk[col] = chunk[col].apply(_normalize_list_value)
    return chunk


# checking status
def clean_chunk(chunk: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    stats = {
        "input_rows": len(chunk),
        "dropped_missing_id_or_body": 0,
        "invalid_rate": 0,
        "invalid_true_to_size_rate": 0,
        "invalid_likes": 0,
        "invalid_dislikes": 0,
        "output_rows": 0,
    }

    before = len(chunk)
    chunk = chunk.dropna(subset=["id", "body"])
    stats["dropped_missing_id_or_body"] = before - len(chunk)

    chunk = coerce_types(chunk)
    chunk = validate_ranges(chunk, stats)
    chunk = normalize_list_columns(chunk)

    stats["output_rows"] = len(chunk)
    return chunk, stats