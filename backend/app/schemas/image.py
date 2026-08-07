from pydantic import BaseModel
from typing import Optional

class ImageBase(BaseModel):
    image_path: str
    alt_text: Optional[str] = None

class ImageCreate(ImageBase):
    catalog_id: int

class ImageOut(ImageBase):
    id: int
    catalog_id: int

    class Config:
        from_attributes = True