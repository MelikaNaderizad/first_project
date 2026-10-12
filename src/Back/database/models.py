from sqlalchemy import Column, Integer, Float, Boolean, String, BigInteger, Index
from database.conn import Base
from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

class Comments(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, autoincrement=False)
    title = Column(String)
    body = Column(String)
    created_at = Column(String)
    rate = Column(Float, index=True)
    recommendation_status = Column(String, index=True)
    is_buyer = Column(Boolean)
    product_id = Column(Integer, index=True)
    advantages = Column(String)
    disadvantages = Column(String)
    likes = Column(Integer)
    dislikes = Column(Integer)
    seller_title = Column(String)
    seller_code = Column(String, index=True)
    true_to_size_rate = Column(Float)

    __table_args__ = (
        Index("ix_comments_status_rate", "recommendation_status", "rate"),
    )

class Products(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=False)
    title_fa = Column(String)
    rate = Column(Integer, index=True)
    rate_cnt = Column(Integer, index=True)
    category1 = Column(String, index=True)
    category2 = Column(String)
    brand = Column(String)
    price = Column(BigInteger)
    seller = Column(String)
    is_fake = Column(Boolean, index=True)
    min_price_last_month = Column(BigInteger)
    sub_category = Column(String)

class ProductComments(Base):
    __tablename__ = "product_comments"

    id = Column(Integer, primary_key=True, autoincrement=False)
    body = Column(String)
    product_id = Column(Integer)
    created_at = Column(String)
    is_buyer = Column(Boolean)
    title_fa = Column(String)


class ProductForecasts(Base):
    __tablename__ = "product_forecasts"

    product_id = Column(Integer, primary_key=True, autoincrement=False)
    total_comments = Column(Integer, index=True)
    mae = Column(Float)
    baseline_mae = Column(Float)
    computed_at = Column(DateTime, server_default=func.now())
    payload = Column(JSONB)    