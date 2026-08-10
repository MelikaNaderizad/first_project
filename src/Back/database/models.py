from sqlalchemy import Column, Integer, Float, Boolean, NVARCHAR
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
    true_to_size_rate = Column(NVARCHAR)