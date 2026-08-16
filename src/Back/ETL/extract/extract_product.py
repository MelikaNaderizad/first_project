import pandas as pd 

def extract_products(path, chunksize = 500):
    for chunk in pd.read_csv(path, chunksize = chunksize, encoding = "utf-8"):
        chunk.columns = chunk.columns.str.lower()
        yield chunk