from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os 
from dotenv import load_dotenv

load_dotenv()

SERVER = os.getenv("DB_SERVER")
DATABASE = os.getenv("DB_DATABASE")
USERNAME = os.getenv("DB_UDERNAME")
PASSWORD = os.getenv("DB_PASSWORD")
DRIVER = os.getenv("DB_DRIVER")

DRIVER_URL_ENCODED = DRIVER.replace(" ", "+") if DRIVER else ""

CONNECTION_STRING =(
    f'mssql+pyodbc://{USERNAME}:{PASSWORD}@{SERVER}/{DATABASE}'
    f'?driver={DRIVER_URL_ENCODED}&TrustServerCertificate=yes'
)

engine = create_engine(CONNECTION_STRING)

sessionlacal = sessionmaker(bind=engine)

Base = declarative_base() #python knows this would be a table in sql


