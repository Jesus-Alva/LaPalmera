# app/schemas/user.py
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None
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
    role: str

    class Config:
        from_attributes = True
