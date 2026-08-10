from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.base_class import Base

class ImagesCatalog(Base):
    __tablename__ = 'images_catalog'

    id = Column(Integer, primary_key=True, autoincrement=True)
    package_id = Column(Integer, ForeignKey('packages.id'), nullable=True)
    space_id = Column(Integer, ForeignKey('spaces.id'), nullable=True)
    banner_id = Column(Integer, ForeignKey('banner.id'), nullable=True)

    package = relationship('Package', back_populates='images_catalogs')
    space = relationship('Space', back_populates='images_catalogs')
    banner = relationship('Banner', back_populates='images_catalogs')
    images = relationship('Image', back_populates='catalog')