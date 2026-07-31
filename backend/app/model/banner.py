from sqlalchemy import Column, BigInteger, String
from sqlalchemy.orm import relationship
from app.base_class import Base

class Banner(Base):
    __tablename__ = 'banner'

    id = Column(BigInteger, primary_key=True, autoincrement=False)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=False)
    description = Column(String(255), nullable=False)  # nombre corregido (era 'descrption')

    images_catalogs = relationship('ImagesCatalog', back_populates='banner')