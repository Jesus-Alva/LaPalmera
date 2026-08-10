from pydantic import BaseModel, Field
from typing import Optional

class SpaceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = True

class SpaceCreate(SpaceBase):
    pass

class SpaceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SpaceOut(SpaceBase):
    id: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True