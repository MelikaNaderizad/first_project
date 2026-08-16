import pandas as pd

def transform_product (chunk: pd.DataFrame) -> pd.DataFrame:

    chunk = chunk.dropna(subset=["id", "title_fa"])
    chunk = chunk.drop_duplicates(subset="id")

    for col in ["rate", "rate_cnt", "price", "min_price_last_month"]:
        chunk[col] = pd.to_numeric(chunk[col], errors="coerce")
        chunk[col] = chunk[col].astype(object).where(chunk[col].notna(), None)

    chunk = chunk.fillna({
        "category1": "",
        "category2": "",
        "brand": "",
        "seller": "",
        "sub_category": "",
    })
    
    return chunk
