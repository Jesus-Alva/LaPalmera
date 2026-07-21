import os
import logging
import httpx  # <-- usar el cliente síncrono

logger = logging.getLogger(__name__)

WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

if not WHATSAPP_ACCESS_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
    logger.warning("Faltan variables de entorno para WhatsApp")

WHATSAPP_API_URL = f"https://graph.facebook.com/v25.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"

def send_whatsapp_message(to: str, message: str) -> dict:
    """Envía un mensaje de texto usando la API Cloud de WhatsApp (síncrono)."""
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

    with httpx.Client(timeout=30.0) as client:
        try:
            response = client.post(WHATSAPP_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            msg_id = data.get("messages", [{}])[0].get("id")
            logger.info(f"Mensaje enviado, ID: {msg_id}")
            return {"success": True, "message_id": msg_id, "data": data}
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error: {e.response.text}")
            return {"success": False, "error": e.response.text}
        except Exception as e:
            logger.exception("Error inesperado")
            return {"success": False, "error": str(e)}