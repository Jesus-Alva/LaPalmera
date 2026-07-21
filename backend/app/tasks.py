from celery import shared_task
from app.utils.whatsapp_utils import send_whatsapp_message
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_whatsapp_task(self, to: str, message: str):
    """Tarea de Celery para enviar mensaje por WhatsApp (síncrona)."""
    try:
        result = send_whatsapp_message(to, message)  # llamada síncrona
        if not result.get("success"):
            logger.warning(f"Fallo al enviar: {result.get('error')}")
            raise Exception(result.get("error", "Error desconocido"))
        return result
    except Exception as e:
        # Reintentar con backoff
        raise self.retry(exc=e)