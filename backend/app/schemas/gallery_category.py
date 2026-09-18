# app/schemas/gallery_category.py
from pydantic import BaseModel
from typing import Optional, List
from app.schemas.gallery_image import GalleryImageOut

class GalleryCategoryBase(BaseModel):
    name: str
    slug: str
    sort_order: Optional[int] = 0

class GalleryCategoryCreate(GalleryCategoryBase):
    pass

class GalleryCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    sort_order: Optional[int] = None

class GalleryCategoryOut(GalleryCategoryBase):
    id: int
    images: List[GalleryImageOut] = []

    class Config:
        from_attributes = True