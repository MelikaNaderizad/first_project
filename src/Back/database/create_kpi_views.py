import sys
from pathlib import Path

BACK_DIR = Path(__file__).resolve().parent.parent  # .../src/Back
ANALYSIS_DIR = BACK_DIR / "analysis"

sys.path.append(str(BACK_DIR))
sys.path.append(str(ANALYSIS_DIR))

from sqlalchemy import text
from database.conn import engine

from queries.products_kpi_queries import product_kpi_query
from queries.sellers_kpi_queries import seller_kpi_query


def _compiled(query):
    return str(
        query.compile(
            engine,
            compile_kwargs={"literal_binds": True},
        )
    )


DDL_STATEMENTS = [
    "DROP MATERIALIZED VIEW IF EXISTS product_kpi_mv;",
    f"CREATE MATERIALIZED VIEW product_kpi_mv AS {_compiled(product_kpi_query)};",
    "CREATE UNIQUE INDEX idx_product_kpi_mv_id ON product_kpi_mv (product_id);",
    "CREATE INDEX idx_product_kpi_mv_status_health ON product_kpi_mv (product_status, product_health_score DESC);",
    "CREATE INDEX idx_product_kpi_mv_rate_desc ON product_kpi_mv (raw_product_rate DESC);",
    "CREATE INDEX idx_product_kpi_mv_rate_cnt_desc ON product_kpi_mv (rate_cnt DESC);",
    "CREATE INDEX idx_product_kpi_mv_bayesian_desc ON product_kpi_mv (bayesian_product_score DESC);",

    "DROP MATERIALIZED VIEW IF EXISTS seller_kpi_mv;",
    f"CREATE MATERIALIZED VIEW seller_kpi_mv AS {_compiled(seller_kpi_query)};",
    "CREATE UNIQUE INDEX idx_seller_kpi_mv_code ON seller_kpi_mv (seller_code);",
    "CREATE INDEX idx_seller_kpi_mv_status_health ON seller_kpi_mv (seller_status, seller_health_score DESC);",
]


if __name__ == "__main__":
    with engine.begin() as conn:
        for stmt in DDL_STATEMENTS:
            print(f"در حال اجرا: {stmt[:80]}...")
            conn.execute(text(stmt))
    print("✅ Materialized View ها با موفقیت ساخته شدند.")