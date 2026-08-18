import pandas as pd

NUMERIC_COLUMNS = ["rate", "rate_cnt", "price", "min_price_last_month"]
TEXT_DEFAULTS = {
    "category1": "",
    "category2": "",
    "brand": "",
    "seller": "",
    "sub_category": "",
}


def transform_product(chunk: pd.DataFrame) -> pd.DataFrame:
    chunk = chunk.dropna(subset=["id", "title_fa", "price"])

    for col in NUMERIC_COLUMNS:
        chunk[col] = pd.to_numeric(chunk[col], errors="coerce")

    chunk["is_fake"] = chunk["is_fake"].astype("boolean")

    chunk = chunk.fillna(TEXT_DEFAULTS)

    return chunk