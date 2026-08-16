from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.base_class import Base

class GalleryImage(Base):
    __tablename__ = 'gallery_images'

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey('gallery_categories.id', ondelete='CASCADE'), nullable=False)
    image_path = Column(String(255), nullable=False)
    alt_text = Column(String(150), nullable=True)
    sort_order = Column(Integer, default=0)

    category = relationship('GalleryCategory', back_populates='images')