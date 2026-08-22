import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SERVER = os.getenv("DB_SERVER")
PORT = os.getenv("DB_PORT", "5432")
DATABASE = os.getenv("DB_DATABASE")
USERNAME = os.getenv("DB_USERNAME")
PASSWORD = os.getenv("DB_PASSWORD")

CONNECTION_STRING = (
    f'postgresql+psycopg2://{USERNAME}:{PASSWORD}@{SERVER}:{PORT}/{DATABASE}'
)

engine = create_engine(
    CONNECTION_STRING,
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    if not all([SERVER, DATABASE, USERNAME, PASSWORD]):
        print("a field is empty")
    else:
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print("connected succesfully")
        except Exception as e:
            print("No connection")
            print(f"error : {e}")