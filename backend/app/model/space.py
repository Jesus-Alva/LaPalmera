from sqlalchemy import Column, Integer, String, Text, Boolean
from app.base_class import Base

class Space(Base):
    __tablename__ = 'spaces'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=True, default=True)