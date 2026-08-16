# app/schemas/package.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date
from app.schemas.package_feature import PackageFeatureOut, PackageFeatureCreate

class PackageBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    short_description: Optional[str] = None
    is_active: Optional[bool] = True
    sort_order: Optional[int] = None
    date_available_start: Optional[date] = None
    date_available_end: Optional[date] = None
    celebration_id: int

class PackageCreate(PackageBase):
    features: Optional[List[PackageFeatureCreate]] = []

class PackageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    short_description: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    date_available_start: Optional[date] = None
    date_available_end: Optional[date] = None
    celebration_id: Optional[int] = None
    features: Optional[List[PackageFeatureCreate]] = None

class PackageOut(PackageBase):
    id: int
    image_url: Optional[str] = None
    celebration_title: Optional[str] = None
    features: List[PackageFeatureOut] = []

    class Config:
        from_attributes = True