import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[2]))

import pandas as pd 
from database.conn import engine, SessionLocal, Base
from database.models import Comments 

Base.metadata.create_all(engine)

df = pd.read_csv(r"C:\Users\w\Desktop\amoozesh_python\digikala\src\data\dataset\digikala-comments.csv", nrows=10)

df.to_sql(name='comments', con=engine, if_exists='append', index=False)
