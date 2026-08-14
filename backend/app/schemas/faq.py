from pydantic import BaseModel, Field
from typing import Optional

class FaqBase(BaseModel):
    question: str = Field(..., min_length=1)
    answer: str = Field(..., min_length=1)
    page_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = True

class FaqCreate(FaqBase):
    pass

class FaqUpdate(BaseModel):
    question: Optional[str] = Field(None, min_length=1)
    answer: Optional[str] = Field(None, min_length=1)
    page_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class FaqOut(FaqBase):
    id: int

    class Config:
        from_attributes = True