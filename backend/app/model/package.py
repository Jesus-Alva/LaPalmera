# app/models/package.py
from sqlalchemy import Column, Integer, String, Text, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.base_class import Base

class Package(Base):
    __tablename__ = 'packages'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    short_description = Column(Text, nullable=True)
    image_path = Column(String(255), nullable=True)  # imagen principal (legado)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, nullable=True)
    
    # Campos de temporada
    date_available_start = Column(Date, nullable=True)  # nullable True para paquetes permanentes
    date_available_end = Column(Date, nullable=True)
    
    # Relación con Celebration
    celebration_id = Column(Integer, ForeignKey('celebrations.id'), nullable=False)
    celebration = relationship('Celebration', back_populates='packages')

    # Relaciones
    images_catalogs = relationship('ImagesCatalog', back_populates='package')
    features = relationship('PackageFeature', back_populates='package')