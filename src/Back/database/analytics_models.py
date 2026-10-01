from sqlalchemy import Column, Integer, BigInteger, Float, Boolean, String
from database.conn import Base


class ProductSalesAnalysis(Base):
    __tablename__ = "product_sales_analysis"

    product_id = Column(Integer, primary_key=True)
    product_name = Column(String)
    brand = Column(String)
    category1 = Column(String)
    category2 = Column(String)
    sub_category = Column(String)
    price = Column(BigInteger)
    product_rate = Column(Integer)
    rate_cnt = Column(Integer)

    comment_id = Column(Integer, primary_key=True)
    sale_date = Column(String)

    comment_rate = Column(Float)
    is_buyer = Column(Boolean)
    recommendation_status = Column(String)
    likes = Column(Integer)
    dislikes = Column(Integer)