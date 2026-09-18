from pydantic import BaseModel, Field
from typing import Optional, List

class BannerBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=255)
    page: Optional[str] = Field(None, max_length=50)

class BannerCreate(BannerBase):
    pass

class BannerUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    subtitle: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    page: Optional[str] = Field(None, max_length=50)

class BannerOut(BannerBase):
    id: int
    image_url: Optional[str] = None
    images_url: Optional[List[str]] = []

    class Config:
        from_attributes = True