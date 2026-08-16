from fastapi import APIRouter
from app.api.v1.endpoint import auth, users, spaces, spaces_images, images, celebrations, locations, team_members, banners, faqs, packages, gallery_categories, gallery_images

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=['Auth'])
api_router.include_router(users.router, prefix="/user", tags=['Users'])
api_router.include_router(spaces.router, prefix="/spaces", tags=["Spaces"])
api_router.include_router(spaces_images.router, prefix="/spaces", tags=["Spaces Images"])
api_router.include_router(images.router, prefix="/images", tags=["Images"])
api_router.include_router(celebrations.router, prefix="/celebrations", tags=["Celebrations"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(team_members.router, prefix="/team-members", tags=["Team Members"])
api_router.include_router(banners.router, prefix="/banners", tags=["Banners"])
api_router.include_router(faqs.router, prefix="/faqs", tags=["FAQs"])
api_router.include_router(packages.router, prefix="/packages", tags=["Packages"])
api_router.include_router(gallery_categories.router, prefix="/gallery-categories", tags=["Gallery Categories"])
api_router.include_router(gallery_images.router, prefix="/gallery-images", tags=["Gallery Images"])

