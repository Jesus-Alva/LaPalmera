from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---- Categorías ----
class GalleryCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    slug: Optional[str] = None  # Se genera automáticamente si no se proporciona
    sort_order: Optional[int] = 0

class GalleryCategoryCreate(GalleryCategoryBase):
    pass

class GalleryCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    slug: Optional[str] = None
    sort_order: Optional[int] = None

class GalleryCategoryOut(GalleryCategoryBase):
    id: int
    image_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ---- Imágenes ----
class GalleryImageBase(BaseModel):
    alt_text: Optional[str] = Field(None, max_length=150)
    sort_order: Optional[int] = 0

class GalleryImageCreate(GalleryImageBase):
    category_id: int
    # image_path se asigna en el backend al subir el archivo

class GalleryImageUpdate(BaseModel):
    alt_text: Optional[str] = Field(None, max_length=150)
    sort_order: Optional[int] = None
    category_id: Optional[int] = None

class GalleryImageOut(GalleryImageBase):
    id: int
    category_id: int
    image_path: str

    class Config:
        from_attributes = True