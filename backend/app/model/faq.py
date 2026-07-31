from sqlalchemy import Column, Integer, Text, Boolean
from app.base_class import Base

class Faq(Base):
    __tablename__ = 'faqs'

    id = Column(Integer, primary_key=True, autoincrement=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    page_id = Column(Integer, nullable=True)  # posible FK a otra tabla, no especificada
    sort_order = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=True, default=True)