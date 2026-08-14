from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os 
from dotenv import load_dotenv
import pyodbc

load_dotenv()

SERVER = os.getenv("DB_SERVER")
DATABASE = os.getenv("DB_DATABASE")
USERNAME = os.getenv("DB_USERNAME")
PASSWORD = os.getenv("DB_PASSWORD")
DRIVER = os.getenv("DB_DRIVER")

DRIVER_URL_ENCODED = DRIVER.replace(" ", "+") if DRIVER else ""

CONNECTION_STRING =(
    f'mssql+pyodbc://{USERNAME}:{PASSWORD}@{SERVER}/{DATABASE}'
    f'?driver={DRIVER_URL_ENCODED}&TrustServerCertificate=yes'
)

engine = create_engine(CONNECTION_STRING, use_insertmanyvalues=False)


# it would'nt guess the type itself
@event.listens_for(engine, "before_cursor_execute") 
def _fix_unicode_batch_insert(conn, cursor, statement, params, context, executemany):
    if executemany:
        cursor.setinputsizes([])

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base() #python knows this would be a table in sql

def get_session():
    db = SessionLocal()
    try:
        # it is a generator
        yield db 
    finally:
        db.close()
    
 
 
if __name__ == "__main__":
    # making sure variables are valid
    if not all([SERVER, DATABASE, USERNAME, PASSWORD, DRIVER]):
        print("one of the arguments is null")
    else:
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
 
            print("connected succesfully")
 
        except Exception as e:
            print("No connection")
            print(f"error : {e}")



