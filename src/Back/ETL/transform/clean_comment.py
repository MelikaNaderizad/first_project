import pandas as pd

NUMERIC_COLUMNS = ["rate", "true_to_size_rate"]

def coerce_types(chunk: pd.DataFrame) -> pd.DataFrame:
    
    for col in NUMERIC_COLUMNS:
        if col in chunk.columns:
            chunk[col] = pd.to_numeric(chunk[col], errors="coerce")
    return chunk    
    # chunk["rate"] = pd.to_numeric(chunk["rate"], errors="coerce")
    # chunk["true_to_size_rate"] = pd.to_numeric(chunk["true_to_size_rate"], errors="coerce")

    # chunk["rate"] = chunk["rate"].astype(object).where(chunk["rate"].notna(), None)
    # chunk["true_to_size_rate"] = chunk["true_to_size_rate"].astype(object).where(
    #     chunk["true_to_size_rate"].notna(), None
    # )

    # chunk = chunk.fillna({
    #     "advantages": "",
    #     "disadvantages": "",
    #     "recommendation_status": "unknown",
    #     "seller_title": "",
    #     "seller_code": "",
    # })

    # return chunk