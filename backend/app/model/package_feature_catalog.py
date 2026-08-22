from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.base_class import Base

class PackageFeatureCatalog(Base):
    __tablename__ = 'package_feature_catalog'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)

    features = relationship('PackageFeature', back_populates='catalog')
