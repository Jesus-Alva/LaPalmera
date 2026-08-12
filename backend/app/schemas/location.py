from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from decimal import Decimal
from datetime import datetime as DateTime

class LocationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    address_line1: str = Field(..., min_length=1, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field('México', max_length=60)
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    phone: Optional[str] = Field(None, max_length=30)
    email: Optional[EmailStr] = Field(None, max_length=100)
    google_maps_url: Optional[str] = Field(None, max_length=500)
    is_primary: Optional[bool] = False
    is_active: Optional[bool] = True
    sort_order: Optional[int] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    address_line1: Optional[str] = Field(None, min_length=1, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=60)
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    phone: Optional[str] = Field(None, max_length=30)
    email: Optional[EmailStr] = Field(None, max_length=100)
    google_maps_url: Optional[str] = Field(None, max_length=500)
    is_primary: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class LocationOut(LocationBase):
    id: int
    created_at: Optional[DateTime] = None
    updated_at: Optional[DateTime] = None

    class Config:
        from_attributes = True