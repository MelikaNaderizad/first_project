from sqlalchemy import text

from database.conn import engine

KPI_VIEWS = ["product_kpi_mv", "seller_kpi_mv"]


def refresh_kpi_views(logger=None):
    for view in KPI_VIEWS:
        try:
            with engine.begin() as conn:
                conn.execute(text(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view};"))
            if logger:
                logger.info(f"{view} با موفقیت رفرش شد.")
        except Exception:
            if logger:
                logger.exception(f"خطا در رفرش {view}")
            else:
                raise