import { WhatsAppSendRequest, WhatsAppSendResponse } from "@/src/types/whatsapp";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api/v1';


export async function sendWhatsAppMessage(params: WhatsAppSendRequest): Promise<WhatsAppSendResponse> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/whatsapp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: params.to,
        message: params.message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // El backend devuelve un detalle de error en formato { detail: "..." }
      throw new Error(data.detail || "Error al enviar el mensaje");
    }

    return {
      success: true,
      message_id: data.message_id,
    };
  } catch (error: any) {
    console.error("Error en sendWhatsAppMessage:", error);
    return {
      success: false,
      error: error.message || "Error de conexión con el servidor",
    };
  }
}
