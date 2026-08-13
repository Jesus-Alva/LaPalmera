from pydantic import BaseModel, Field
from typing import Optional

class TeamMemberBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    photo_path: Optional[str] = None
    photo_alt: Optional[str] = Field(None, max_length=100)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = True

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[str] = Field(None, min_length=1, max_length=100)
    photo_path: Optional[str] = None
    photo_alt: Optional[str] = Field(None, max_length=100)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class TeamMemberOut(TeamMemberBase):
    id: int

    class Config:
        from_attributes = True