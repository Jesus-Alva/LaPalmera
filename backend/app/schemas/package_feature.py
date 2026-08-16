from pydantic import BaseModel

class PackageFeatureBase(BaseModel):
    feature_key: str
    feature_value: str

class PackageFeatureCreate(PackageFeatureBase):
    pass

class PackageFeatureOut(PackageFeatureBase):
    id: int
    package_id: int

    class Config:
        from_attributes = True