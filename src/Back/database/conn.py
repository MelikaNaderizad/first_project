# src/Back/database/conn.py
import logging
from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
import pyodbc

load_dotenv()

logger = logging.getLogger(__name__)

SERVER = os.getenv("DB_SERVER")
DATABASE = os.getenv("DB_DATABASE")
USERNAME = os.getenv("DB_USERNAME")
PASSWORD = os.getenv("DB_PASSWORD")
DRIVER = os.getenv("DB_DRIVER")

DRIVER_URL_ENCODED = DRIVER.replace(" ", "+") if DRIVER else ""

CONNECTION_STRING = (
    f'mssql+pyodbc://{USERNAME}:{PASSWORD}@{SERVER}/{DATABASE}'
    f'?driver={DRIVER_URL_ENCODED}&TrustServerCertificate=yes'
)

engine = create_engine(
    CONNECTION_STRING,
    use_insertmanyvalues=False,   # خاموش کردن insertmanyvalues تا fast_executemany جاش رو بگیره
    fast_executemany=True,        # فعال‌سازی batch واقعی pyodbc
)

@event.listens_for(engine, "before_cursor_execute")
def _fix_unicode_batch_insert(conn, cursor, statement, params, context, executemany):
    if executemany:
        cursor.fast_executemany = True  # تضمینی، مستقل از اینکه create_engine چطور رفتار کرده
        # قبلاً اینجا print() بود که همیشه مستقیم روی ترمینال چاپ می‌شد،
        # مستقل از تنظیمات logging. با logger.debug جایگزین شد؛ چون
        # سطح پیش‌فرض لاگ INFO هست، این پیام نه توی فایل نه توی ترمینال
        # چاپ نمی‌شه مگر level رو صریحاً DEBUG کنی.
        logger.debug(
            "executemany batch | cursor.fast_executemany = %s",
            cursor.fast_executemany,
        )
        cursor.setinputsizes([])

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    if not all([SERVER, DATABASE, USERNAME, PASSWORD, DRIVER]):
        print("one of the arguments is null")
    else:
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print("connected succesfully")
            print("fast_executemany:", engine.dialect.fast_executemany)
        except Exception as e:
            print("No connection")
            print(f"error : {e}")