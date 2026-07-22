# backend/app/api/endpoint/whatsapp.py
import httpx
from dotenv import load_dotenv
import os
from fastapi import APIRouter, HTTPException, status
from app.schemas.whatsapp import WhatsAppMessageRequest

load_dotenv()

router = APIRouter()

# Variables de entorno (debes definirlas en .env)
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_FROM_PHONE = os.getenv("WHATSAPP_FROM_PHONE")  # tu número de negocio (opcional, no lo usa la API, solo para referencia)
META_API_URL = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"

@router.post("/send", status_code=status.HTTP_200_OK)
async def send_whatsapp_message(payload: WhatsAppMessageRequest):
    """
    Envía un mensaje de texto a través de WhatsApp Cloud API.
    """
    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>20 Endpoint")
    print(WHATSAPP_TOKEN)
    print(WHATSAPP_FROM_PHONE)
    print(META_API_URL)
    print(WHATSAPP_PHONE_NUMBER_ID)


    if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="WhatsApp configuration missing on server"
        )

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

    # Payload que espera la API de Meta
    data = {
        "messaging_product": "whatsapp",
        "to": payload.to,
        "type": "text",
        "text": {
            "body": payload.message
        }
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(META_API_URL, headers=headers, json=data)
            response.raise_for_status()  # lanza excepción si status >= 400
            result = response.json()
            return {
                "success": True,
                "message_id": result.get("messages", [{}])[0].get("id"),
                "meta": result
            }
        except httpx.HTTPStatusError as e:
            # Extraer mensaje de error de Meta si existe
            error_detail = "Unknown error"
            try:
                error_data = e.response.json()
                error_detail = error_data.get("error", {}).get("message", str(e))
            except:
                error_detail = str(e)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"WhatsApp API error: {error_detail}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Internal server error: {str(e)}"
            )