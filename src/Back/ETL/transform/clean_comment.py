import pandas as pd

NUMERIC_COLUMNS = ["rate", "rate_cnt", "price", "min_price_last_month"]


def coerce_types(chunk: pd.DataFrame) -> pd.DataFrame:
    for col in NUMERIC_COLUMNS:
        if col in chunk.columns:
            # pd.to_numeric با errors="coerce" همیشه dtype رو یکدست
            # (float64) نگه می‌داره؛ برخلاف astype(object) که باعث
            # قاطی‌شدن int/float/None توی ستون و شکستن fast_executemany
            # موقع insert چند هزار ردیفی می‌شد.
            chunk[col] = pd.to_numeric(chunk[col], errors="coerce")
    return chunk


def validate_ranges(chunk: pd.DataFrame, stats: dict) -> pd.DataFrame:
    if "rate" in chunk.columns:
        invalid_rate = (chunk["rate"] < 0) | (chunk["rate"] > 5)
        stats["invalid_rate"] += int(invalid_rate.sum())
        chunk.loc[invalid_rate, "rate"] = float("nan")

    if "rate_cnt" in chunk.columns:
        invalid_rate_cnt = chunk["rate_cnt"] < 0
        stats["invalid_rate_cnt"] += int(invalid_rate_cnt.sum())
        chunk.loc[invalid_rate_cnt, "rate_cnt"] = 0

    if "price" in chunk.columns:
        invalid_price = chunk["price"] < 0
        stats["invalid_price"] += int(invalid_price.sum())
        chunk.loc[invalid_price, "price"] = 0

    if "min_price_last_month" in chunk.columns:
        invalid_min_price = chunk["min_price_last_month"] < 0
        stats["invalid_min_price_last_month"] += int(invalid_min_price.sum())
        chunk.loc[invalid_min_price, "min_price_last_month"] = 0

    return chunk


def clean_chunk(chunk: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    stats = {
        "input_rows": len(chunk),
        "dropped_missing_id_or_title": 0,
        "invalid_rate": 0,
        "invalid_rate_cnt": 0,
        "invalid_price": 0,
        "invalid_min_price_last_month": 0,
        "output_rows": 0,
    }

    before = len(chunk)
    chunk = chunk.dropna(subset=["id", "title_fa"])
    stats["dropped_missing_id_or_title"] = before - len(chunk)

    chunk = coerce_types(chunk)
    chunk = validate_ranges(chunk, stats)

    stats["output_rows"] = len(chunk)

    return chunk, stats