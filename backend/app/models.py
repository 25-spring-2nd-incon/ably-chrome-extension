# from .db import Base
# from sqlalchemy import Column, Integer, Text
# from sqlalchemy import Column, TEXT, INT, BIGINT
# from sqlalchemy.ext.declarative import declarative_base

# Base = declarative_base()

# class ProductOpinion(Base):
#     __tablename__ = "product_opinion"

#     id = Column(Integer, primary_key=True, autoincrement=True)
#     product_ID = Column(Integer, index=True)
#     opinion = Column(Text, nullable=False)

from sqlalchemy import Column, Integer, String, Text, BigInteger
from .db import Base

class ProductOpinion(Base):
    __tablename__ = "product_opinion"
    
    ID = Column(BigInteger, primary_key=True, autoincrement=True)
    product_ID = Column(BigInteger, index=True) # product_ID로 검색
    sentence_ID = Column(Integer),
    review_ID = Column(BigInteger),
    cleaned_sentence = Column(Text)
    aspect_span = Column(Text) # 1
    opinion_span = Column(Text)
    cleaned_opinion_span = Column(Text) # 2
    sentiment = Column(String(3)) # 3 (POS, NEG, NEU)
    category = Column(String(50))