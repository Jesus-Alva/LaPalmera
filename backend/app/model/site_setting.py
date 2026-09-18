from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.base_class import Base

class SiteSetting(Base):
    __tablename__ = 'site_settings'

    setting_key = Column(String(80), primary_key=True)
    setting_value = Column(JSONB, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
