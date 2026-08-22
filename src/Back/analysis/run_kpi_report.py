import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from sqlalchemy.orm import Session
from database.conn import engine

sys.path.append(str(Path(__file__).resolve().parent))
from queries.comments_kpi_queries import comment_kpi_query
from queries.products_kpi_queries import product_kpi_query
from queries.sellers_kpi_queries import seller_kpi_query

def run_query (query):
    with Session(engine) as session:
        return session.execute(query).mappings().all()

comment_kpi_result = run_query(comment_kpi_query)
product_kpi_result = run_query(product_kpi_query)
seller_kpi_result = run_query(seller_kpi_query)