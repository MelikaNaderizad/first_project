from sqlalchemy import text
from conn import engine


def create_product_sales_view():
    sql = text("""
        CREATE OR REPLACE VIEW product_sales_analysis AS
        SELECT
            p.id AS product_id,
            p.title_fa AS product_name,
            p.brand,
            p.category1,
            p.category2,
            p.sub_category,
            p.price,
            p.rate AS product_rate,
            p.rate_cnt,
            c.id AS comment_id,
            c.created_at AS sale_date,
            c.rate AS comment_rate,
            c.is_buyer,
            c.recommendation_status,
            c.likes,
            c.dislikes
        FROM products p
        INNER JOIN comments c
            ON c.product_id = p.id
        WHERE c.is_buyer = TRUE;
    """)

    with engine.begin() as conn:
        conn.execute(sql)