// components/WhatsAppButton.tsx
import React from 'react';
import { FALLBACK_WHATSAPP_PHONE } from '@/lib/constants/contact';

interface WhatsAppButtonProps {
  phone?: string;        // Código país + número, sin '+' ni espacios. Ej: "521234567890"
  message: string;      // Mensaje predeterminado (texto plano)
  children?: React.ReactNode;
  className?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = FALLBACK_WHATSAPP_PHONE,
  message,
  children, 
  className = "inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition" 
}) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children || "Enviar WhatsApp"}
    </a>
  );
};

export default WhatsAppButton;