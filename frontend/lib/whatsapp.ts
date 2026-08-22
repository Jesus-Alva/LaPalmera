/**
 * site_settings.social_networks.whatsapp guarda una URL completa
 * (ej. "https://wa.me/525646133614"), igual que el resto de redes sociales.
 * WhatsAppButton necesita solo el número para poder armarle su propio mensaje
 * predefinido (?text=...), así que aquí se extrae.
 */
export function extractWhatsAppPhone(whatsappUrl: string | undefined | null): string | undefined {
  if (!whatsappUrl) return undefined;
  const match = whatsappUrl.match(/(\d{6,15})/);
  return match ? match[1] : undefined;
}
