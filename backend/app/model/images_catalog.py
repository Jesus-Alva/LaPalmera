from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.base_class import Base

class ImagesCatalog(Base):
    __tablename__ = 'images_catalog'

    id = Column(Integer, primary_key=True, autoincrement=False)
    package_id = Column(Integer, ForeignKey('packages.id'), nullable=False)
    space_id = Column(Integer, ForeignKey('spaces.id'), nullable=False)
    banner_id = Column(Integer, ForeignKey('banner.id'), nullable=False)

    package = relationship('Package', back_populates='images_catalogs')
    space = relationship('Space')  # Space no tiene relación inversa (opcional)
    banner = relationship('Banner', back_populates='images_catalogs')
    images = relationship('Image', back_populates='catalog')