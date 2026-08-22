from pydantic import BaseModel

class PackageFeatureCreate(BaseModel):
    catalog_id: int
    feature_value: str

class PackageFeatureOut(BaseModel):
    id: int
    package_id: int
    catalog_id: int
    feature_key: str
    feature_value: str

    class Config:
        from_attributes = True
