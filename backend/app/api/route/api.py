from fastapi import APIRouter
from app.api.endpoint import whatsapp

api_router = APIRouter()

api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=['WhatsApp'])