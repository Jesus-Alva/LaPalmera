# app/schemas/gallery_image.py
from pydantic import BaseModel
from typing import Optional

class GalleryImageBase(BaseModel):
    alt_text: Optional[str] = None
    sort_order: Optional[int] = 0

class GalleryImageCreate(GalleryImageBase):
    category_id: int
    image_path: str

class GalleryImageOut(GalleryImageBase):
    id: int
    category_id: int
    image_path: str

    class Config:
        from_attributes = True