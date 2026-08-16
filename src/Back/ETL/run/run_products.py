import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from extract.extract_product import extract_products
from transform.clean_product import transform_product
from load.load_product import load_products
from config import PRODUCTS_CSV
from database.conn import engine
from database.models import Base
from itertools import islice

Base.metadata.create_all(engine)

total = 0
chunk_num = 0

for chunk in islice(extract_products(PRODUCTS_CSV, chunksize=5000), 2):
    cleaned = transform_product(chunk)
    load_products(cleaned)
    total += len(cleaned)
    chunk_num += 1

    if chunk_num % 50 == 0:
        print(f"{chunk_num} rows added")

print(f"{total} rows added successfully")