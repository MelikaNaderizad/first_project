import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

import pandas as pd
from database.models import Products
from database.conn import SessionLocal
from sqlalchemy.exc import IntegrityError

def load_products(df: pd.DataFrame):
    records = df.to_dict("records")
    session = SessionLocal()

    try:
        session.bulk_insert_mappings(Products, records)
        session.commit()
    except IntegrityError:
        session.rollback()
        for record in records:
            try:
                session.bulk_insert_mappings(Products, [record])
                session.commit()
            except IntegrityError:
                session.rollback()                  
    finally:
            session.close()    