from pydantic import BaseModel, Field
from typing import Optional

class BannerBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subtitle: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=255)

class BannerCreate(BannerBase):
    pass

class BannerUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    subtitle: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1, max_length=255)

class BannerOut(BannerBase):
    id: int

    class Config:
        from_attributes = True