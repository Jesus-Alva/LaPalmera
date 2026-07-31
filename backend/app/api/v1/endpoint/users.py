# app/api/v1/endpoints/users.py
from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user
from app.schemas.user import UserOut
from app.model.user import User

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user