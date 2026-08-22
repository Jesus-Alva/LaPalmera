from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.base_class import Base

class PackageFeature(Base):
    __tablename__ = 'package_features'

    id = Column(Integer, primary_key=True, autoincrement=True)
    package_id = Column(Integer, ForeignKey('packages.id'), nullable=False)
    catalog_id = Column(Integer, ForeignKey('package_feature_catalog.id'), nullable=False)
    feature_value = Column(String(255), nullable=False)

    package = relationship('Package', back_populates='features')
    catalog = relationship('PackageFeatureCatalog', back_populates='features')

    @property
    def feature_key(self) -> str:
        return self.catalog.name if self.catalog else ""
