# app/schemas/user.py
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, validator

UserRole = Literal["admin", "editor", "read"]
UserStatus = Literal["active", "inactive", "suspended"]

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None
    phone: str | None = None
    address: str | None = None
    notifications_enabled: bool = True
    @validator('password')
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not any(char.isupper() for char in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        return v

class UserOut(BaseModel):
    id: int
    email: str
    display_name: str | None
    phone: str | None
    address: str | None
    role: str
    status: str
    notifications_enabled: bool
    last_login_at: datetime | None

    class Config:
        from_attributes = True

class UserAdminUpdate(BaseModel):
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
