from fastapi import APIRouter
from app.api.v1.endpoint import auth, users, spaces, spaces_images, images

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=['Auth'])
api_router.include_router(users.router, prefix="/user", tags=['Users'])
api_router.include_router(spaces.router, prefix="/spaces", tags=["Spaces"])
api_router.include_router(spaces_images.router, prefix="/spaces", tags=["Spaces Images"])
api_router.include_router(images.router, prefix="/images", tags=["Images"])