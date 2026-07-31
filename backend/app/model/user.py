from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.base_class import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=True)
    role = Column(String(20), nullable=True, default='editor')
    created_at = Column(DateTime, nullable=True, server_default=func.now())