'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface DataPolicyNoticeProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

export default function DataPolicyNotice({ accepted, onAcceptedChange }: DataPolicyNoticeProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div className="flex items-start gap-2 text-sm text-gray-200">
        <div className="min-w-0">
          <label htmlFor="dataPolicyAccepted" className="flex cursor-pointer items-start gap-2 text-gray-700 dark:text-gray-200 text-sm">
            <input
              id="dataPolicyAccepted"
              type="checkbox"
              checked={accepted}
              onChange={(event) => onAcceptedChange(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary/50"
              required
            />
            <span>Acepto el tratamiento de mis datos conforme a la información proporcionada.</span>
          </label>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-1 ml-6 font-medium text-primary underline underline-offset-2 hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
          >
            Consultar política de datos
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/20 bg-gray-950 p-6 text-gray-200 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="data-policy-title"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              aria-label="Cerrar política de datos"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="pr-8">
              <h2 id="data-policy-title" className="font-semibold text-white">
                Tratamiento de tus datos
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-300">
                <p>
                  Para crear tu cuenta necesitamos tu correo electrónico y contraseña. También puedes proporcionar tu nombre, teléfono y dirección para facilitar la gestión de tu cuenta.
                </p>
                <p>
                  Usaremos estos datos para crear y administrar tu cuenta, autenticarte y mostrarte las funciones disponibles según tu perfil.
                </p>
                <p>
                  La opción de notificaciones es voluntaria y sólo se utilizará para enviarte comunicaciones y promociones si la mantienes activada.
                </p>
                <p>
                  No compartas información sensible que no sea necesaria para el registro. Puedes solicitar la actualización de tus datos mediante los canales de contacto del sitio.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
