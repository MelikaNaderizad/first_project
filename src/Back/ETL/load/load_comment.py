import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

import pandas as pd
from database.models import Comments
from database.conn import SessionLocal
from sqlalchemy.exc import IntegrityError

def load_comments(df: pd.DataFrame):
    records = df.to_dict("records")
    session = SessionLocal()

    try:
        session.bulk_insert_mappings(Comments, records)
        session.commit()
    except IntegrityError:
        session.rollback()
        for record in records:
            try:
                session.bulk_insert_mappings(Comments, [record])
                session.commit()
            except IntegrityError:
                session.rollback()                  
    finally:
         session.close()    
