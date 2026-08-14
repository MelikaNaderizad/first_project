import pandas as pd

def extract_comments(path, chunksize = 100):
    for chunk in pd.read_csv(path, chunksize=chunksize, encoding="utf-8"):
        yield chunk
