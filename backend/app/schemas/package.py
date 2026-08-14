# app/schemas/package.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import date

class PackageBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    short_description: Optional[str] = None
    image_path: Optional[str] = None
    is_active: Optional[bool] = True
    sort_order: Optional[int] = None
    celebration_id: int
    data_available_start: Optional[date] = None
    data_available_end: Optional[date] = None

    @validator('data_available_end')
    def validate_dates(cls, v, values):
        start = values.get('data_available_start')
        if start and v and v < start:
            raise ValueError('La fecha de fin debe ser posterior a la fecha de inicio')
        return v

class PackageCreate(PackageBase):
    pass

class PackageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    short_description: Optional[str] = None
    image_path: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    celebration_id: Optional[int] = None
    data_available_start: Optional[date] = None
    data_available_end: Optional[date] = None

    @validator('data_available_end')
    def validate_dates(cls, v, values):
        start = values.get('data_available_start')
        if start and v and v < start:
            raise ValueError('La fecha de fin debe ser posterior a la fecha de inicio')
        return v

class PackageOut(PackageBase):
    id: int
    image_url: Optional[str] = None  # imagen destacada (primera del catálogo)
    celebration_title: Optional[str] = None  # para mostrar en listado
    is_available: Optional[bool] = True  # calculado: disponible si está activo y dentro de rango de fechas (si aplica)

    class Config:
        from_attributes = True