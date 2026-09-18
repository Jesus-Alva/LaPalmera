from sqlalchemy import Column, Integer, String, Boolean
from app.base_class import Base

class TeamMember(Base):
    __tablename__ = 'team_members'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    photo_path = Column(String(255), nullable=True)
    photo_alt = Column(String(100), nullable=True)
    sort_order = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=True, default=True)