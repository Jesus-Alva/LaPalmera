from fastapi import APIRouter, HTTPException, Depends
from app.schemas.whatsapp import WhatsAppMessageRequest, WhatsAppMessageResponse
from app.tasks import send_whatsapp_task
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

@router.post("/send", response_model=WhatsAppMessageResponse)
async def send_whatsapp(request: WhatsAppMessageRequest):
    """
    Endpoint para enviar un mensaje de WhatsApp de forma asíncrona usando Celery.
    """
    try:
        # Llamar a la tarea de Celery de forma asíncrona
        task = send_whatsapp_task.delay(to=request.to, message=request.message)
        # Podrías guardar el task_id en la BD para hacer seguimiento, pero aquí retornamos éxito inmediato.
        return WhatsAppMessageResponse(
            success=True,
            message_id=None,  # Podríamos obtenerlo después del resultado, pero es asíncrono
            error=None,
        )
    except Exception as e:
        logger.exception("Error al encolar tarea de WhatsApp")
        raise HTTPException(status_code=500, detail=str(e))