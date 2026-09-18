from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.base_class import Base

class GalleryCategory(Base):
    __tablename__ = 'gallery_categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(80), nullable=False)
    slug = Column(String(80), unique=True, nullable=False)
    sort_order = Column(Integer, default=0)
    
    # app/models/gallery_category.py
    images = relationship('GalleryImage', back_populates='category', cascade='all, delete-orphan')