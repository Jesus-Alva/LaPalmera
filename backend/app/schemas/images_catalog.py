from pydantic import BaseModel
from typing import Optional
from app.schemas.image import ImageOut

class ImagesCatalogBase(BaseModel):
    package_id: Optional[int] = None
    space_id: Optional[int] = None
    banner_id: Optional[int] = None

class ImagesCatalogCreate(ImagesCatalogBase):
    pass

class ImagesCatalogOut(ImagesCatalogBase):
    id: int
    images: list[ImageOut] = []

    class Config:
        from_attributes = True