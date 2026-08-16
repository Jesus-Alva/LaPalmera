from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.gallery_image import GalleryImageOut

class GalleryCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    slug: str = Field(..., min_length=1, max_length=80, pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
    sort_order: Optional[int] = 0

class GalleryCategoryCreate(GalleryCategoryBase):
    pass

class GalleryCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    slug: Optional[str] = Field(None, min_length=1, max_length=80, pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
    sort_order: Optional[int] = None

class GalleryCategoryOut(GalleryCategoryBase):
    id: int
    images: List[GalleryImageOut] = []

    class Config:
        from_attributes = True