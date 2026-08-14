import pandas as pd

def transform_comment (chunk: pd.DataFrame) :

    chunk = chunk.dropna(subset=["id", "title", "body"])
    chunk = chunk.drop_duplicates(subset="id")
    chunk["rate"] = pd.to_numeric(chunk["rate"], errors="coerce")
    chunk["true_to_size_rate"] = pd.to_numeric(chunk["true_to_size_rate"], errors="coerce")
    chunk["rate"] = chunk["rate"].astype(object).where(chunk["rate"].notna(), None)
    chunk["true_to_size_rate"] = chunk["true_to_size_rate"].astype(object).where(chunk["true_to_size_rate"].notna(), None)
    chunk = chunk.fillna({
          "advantages":"",
         "disadvantages":"",
         "recommendation_status":"unknown",
        "seller_title": "",
        "seller_code": "",
    })   

    return chunk
