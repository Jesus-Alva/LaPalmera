from pydantic import BaseModel, Field, constr
from typing import Optional

class WhatsAppMessageRequest(BaseModel):
    to: constr(min_length=10, max_length=15)  # número con código de país, sin +
    message: str = Field(..., min_length=1, max_length=4096)

    class Config:
        schema_extra = {
            "example": {
                "to": "5215646133614",
                "message": "Hola, este es un mensaje de prueba"
            }
        }
    
class WhatsAppMessageResponse(BaseModel):
    success: bool
    message_id: Optional[str] = None
    error: Optional[str] = None