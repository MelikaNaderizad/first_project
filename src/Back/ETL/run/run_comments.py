import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from extract.extract_comment import extract_comments
from transform.clean_comment import transform_comment
from load.load_comment import load_comments
from config import COMMENTS_CSV
from database.conn import engine
from database.models import Base
from itertools import islice

Base.metadata.create_all(engine)

total = 0
chunk_num = 0

for chunk in islice(extract_comments(COMMENTS_CSV, chunksize=100), 2):
    cleaned = transform_comment(chunk)
    load_comments(cleaned)
    total += len(cleaned)
    chunk_num += 1

    if chunk_num % 50 == 0:
        print(f"{chunk_num} rows added")

print(f"{total} rows added successfully")