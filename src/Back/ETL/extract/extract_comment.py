import pandas as pd

def extract_comments(path, chunksize = 500):
    for chunk in pd.read_csv(path, chunksize=chunksize, encoding="utf-8"):
        yield chunk

