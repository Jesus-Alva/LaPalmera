from pydantic import BaseModel, Field

class PackageFeatureCatalogBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)

class PackageFeatureCatalogCreate(PackageFeatureCatalogBase):
    pass

class PackageFeatureCatalogOut(PackageFeatureCatalogBase):
    id: int

    class Config:
        from_attributes = True
