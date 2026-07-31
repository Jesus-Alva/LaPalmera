from sqlalchemy import Column, BigInteger, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.base_class import Base

class Image(Base):
    __tablename__ = 'images'

    id = Column(BigInteger, primary_key=True, autoincrement=False)
    catalog_id = Column(Integer, ForeignKey('images_catalog.id'), nullable=False)
    image_path = Column(String(255), nullable=False)
    alt_text = Column(String(255), nullable=False)

    catalog = relationship('ImagesCatalog', back_populates='images')