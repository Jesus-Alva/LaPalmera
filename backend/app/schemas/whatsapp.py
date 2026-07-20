from pydantic import BaseModel, Field
from typing import Optional

class WhatsAppMessageRequest(BaseModel):
    to: str =  Field(..., description="Número de teléfono del destinatario (formato internacional, sin '+')")
    message: str = Field(..., description=("Cuerpo del mensauje a enviar"))
    
class WhatsAppMessageResponse(BaseModel):
    success: bool
    message_id: Optional[str] = None
    error: Optional[str] = None