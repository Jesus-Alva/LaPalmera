from pydantic import BaseModel
from typing import Optional

class GalleryImageBase(BaseModel):
    image_path: str
    alt_text: Optional[str] = None
    sort_order: Optional[int] = 0

class GalleryImageCreate(GalleryImageBase):
    category_id: int

class GalleryImageUpdate(BaseModel):
    alt_text: Optional[str] = None
    sort_order: Optional[int] = None

class GalleryImageOut(GalleryImageBase):
    id: int
    category_id: int

    class Config:
        from_attributes = True