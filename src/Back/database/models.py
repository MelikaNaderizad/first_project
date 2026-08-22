from sqlalchemy import Column, Integer, Float, Boolean, String, BigInteger
from database.conn import Base

class Comments(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, autoincrement=False)
    title = Column(String)
    body = Column(String)
    created_at = Column(String)
    rate = Column(Float)
    recommendation_status = Column(String)
    is_buyer = Column(Boolean)
    product_id = Column(Integer)
    advantages = Column(String)
    disadvantages = Column(String)
    likes = Column(Integer)
    dislikes = Column(Integer)
    seller_title = Column(String)
    seller_code = Column(String)
    true_to_size_rate = Column(Float)

class Products(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=False)
    title_fa = Column(String)
    rate = Column(Integer)
    rate_cnt = Column(Integer)
    category1 = Column(String)
    category2 = Column(String)
    brand = Column(String)
    price = Column(BigInteger)
    seller = Column(String)
    is_fake = Column(Boolean)
    min_price_last_month = Column(BigInteger)
    sub_category = Column(String)