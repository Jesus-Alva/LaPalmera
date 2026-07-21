import { WhatsAppSendRequest, WhatsAppSendResponse } from "@/src/types/whatsapp";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api/v1';

export async function sendWhatsAppMessage(data: WhatsAppSendRequest): Promise<WhatsAppSendResponse>
{
    const response = await fetch(`${BACKEND_API_URL}/whatsapp/send`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })

    if (!response.ok){
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return response.json();
}
