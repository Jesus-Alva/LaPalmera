// components/WhatsAppButton.tsx
import React from 'react';

interface WhatsAppButtonProps {
  phone?: string;        // Código país + número, sin '+' ni espacios. Ej: "521234567890"
  message: string;      // Mensaje predeterminado (texto plano)
  children?: React.ReactNode;
  className?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phone = "525552978415", 
  message, 
  children, 
  className = "" 
}) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${className}`}
    >
      {children || "Enviar WhatsApp"}
    </a>
  );
};

export default WhatsAppButton;