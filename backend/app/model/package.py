from sqlalchemy import Column, Integer, String, Text, Boolean, Date
from sqlalchemy.orm import relationship
from app.base_class import Base

class Package(Base):
    __tablename__ = 'packages'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    short_description = Column(Text, nullable=True)
    image_path = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=True, default=True)
    sort_order = Column(Integer, nullable=True)
    # los data son False ya que serviran para validar, si lleva fecha son paquetes que expiran, si no se registran
    # las fechas los paquetes son permanentes y no expiran, por lo que no se validara la fecha de expiracion
    data_available_start = Column(Date, nullable=False)
    data_available_end = Column(Date, nullable=False)

    # Relaciones (usando cadenas para evitar importación circular)
    images_catalogs = relationship('ImagesCatalog', back_populates='package')
    features = relationship('PackageFeature', back_populates='package')