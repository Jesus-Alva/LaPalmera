import os
import logging
import httpx
from typing import Dict, Any

logger = logging.getLogger(__name__)
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_API_URL = f"https://graph.facebook.com/v19.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"

async def send_whatsapp_message(to: str, message: str) -> Dict[str, Any]:
    """
    Envía un mensaje de texto a través de la API de WhatsApp Cloud.
    Retorna el resultado de la API de Meta.
    """
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(WHATSAPP_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            logger.info(f"Mensaje enviado correctamente: {data}")
            return {"success": True, "message_id": data.get("messages", [{}])[0].get("id"), "data": data}
        except httpx.HTTPStatusError as e:
            logger.error(f"Error HTTP al enviar mensaje: {e.response.text}")
            return {"success": False, "error": e.response.text}
        except Exception as e:
            logger.exception("Error inesperado al enviar mensaje")
            return {"success": False, "error": str(e)}