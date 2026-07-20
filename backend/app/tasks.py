from celery import shared_task
from app.utils.whatsapp_utils import send_whatsapp_message
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_whatsapp_task(self, to: str, message: str):
    """
    Tarea de Celery para enviar un mensaje de WhatsApp.
    """
    try:
        result = send_whatsapp_message(to, message)
        if not result.get("success"):
            # Si falla, reintentar
            logger.warning(f"Fallo al enviar mensaje, reintentando...")
            raise Exception(result.get("error", "Error desconocido"))
        return result
    except Exception as e:
        # Reintentar la tarea en caso de error
        raise self.retry(exc=e)