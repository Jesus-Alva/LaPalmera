# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None

class UserOut(BaseModel):
    id: int
    email: str
    display_name: str | None
    role: str

    class Config:
        from_attributes = True
