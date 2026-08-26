from sqlalchemy import Column, Integer, String, Numeric, Boolean
from database.conn import Base


class ProductKpiView(Base):
    __tablename__ = "product_kpi_mv"
    __table_args__ = {"extend_existing": True}

    product_id = Column(Integer, primary_key=True)
    title_fa = Column(String)
    raw_product_rate = Column(Numeric)
    rate_cnt = Column(Integer)
    positive_comments = Column(Integer)
    negative_comments = Column(Integer)
    bayesian_product_score = Column(Numeric)
    sentiment_score = Column(Numeric)
    product_health_score = Column(Numeric)
    product_status = Column(String)


class SellerKpiView(Base):
    __tablename__ = "seller_kpi_mv"
    __table_args__ = {"extend_existing": True}

    seller_code = Column(String, primary_key=True)
    seller_title = Column(String)
    sold_products = Column(Integer)
    total_comments = Column(Integer)
    positive_comments = Column(Integer)
    negative_comments = Column(Integer)
    customer_satisfaction_score = Column(Numeric)
    fake_product_percent = Column(Numeric)
    low_rated_product_percent = Column(Numeric)
    seller_health_score = Column(Numeric)
    seller_status = Column(String)