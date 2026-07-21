export interface WhatsAppSendRequest {
    to: string;
    message: string;
}

export interface WhatsAppSendResponse {
    success: boolean;
    message_id?: string;
    error?: string;
}