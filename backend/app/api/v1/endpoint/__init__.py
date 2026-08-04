# app/api/v1/__init__.py
from fastapi import APIRouter
from app.api.v1.endpoint import auth, users, spaces

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(spaces.router, prefix="/spaces", tags=["spaces"])