from sqlalchemy import Column, Integer, Float, Boolean, NVARCHAR, BigInteger
from database.conn import Base
class Comments(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, autoincrement=False)
    title = Column(NVARCHAR)
    body = Column(NVARCHAR)
    created_at = Column(NVARCHAR)
    rate = Column(Float)
    recommendation_status = Column(NVARCHAR)
    is_buyer = Column(Boolean)
    product_id = Column(Integer)
    advantages = Column(NVARCHAR)
    disadvantages = Column(NVARCHAR)
    likes = Column(Integer)
    dislikes = Column(Integer)
    seller_title = Column(NVARCHAR)
    seller_code = Column(NVARCHAR)
    true_to_size_rate = Column(Float)

class Products(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=False)
    title_fa = Column(NVARCHAR)
    rate = Column(Integer)
    rate_cnt = Column(Integer)
    category1 = Column(NVARCHAR)
    category2 = Column(NVARCHAR)
    brand = Column(NVARCHAR)
    price = Column(BigInteger)
    seller = Column(NVARCHAR)
    is_fake = Column(Boolean)
    min_price_last_month = Column(Integer)
    sub_category = Column(NVARCHAR)