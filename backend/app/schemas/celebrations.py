from pydantic import BaseModel, Field
from typing import Optional

class CelebrationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = True

class CelebrationCreate(CelebrationBase):
    pass

class CelebrationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class CelebrationOut(CelebrationBase):
    id: int

    class Config:
        from_attributes = True