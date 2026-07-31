from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.base_class import Base

class PackageFeature(Base):
    __tablename__ = 'package_features'

    id = Column(Integer, primary_key=True, autoincrement=False)
    package_id = Column(Integer, ForeignKey('packages.id'), nullable=False)
    feature_key = Column(String(255), nullable=False)
    feature_value = Column(String(255), nullable=False)

    package = relationship('Package', back_populates='features')