'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, X } from 'lucide-react';

interface DataPolicyNoticeProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

const SECCIONES = [
  { id: 'intro',       titulo: '1. Introducción',       icono: '📖' },
  { id: 'responsable', titulo: '2. Responsable',        icono: '👤' },
  { id: 'datos',       titulo: '3. Datos Recopilados',  icono: '📊' },
  { id: 'finalidad',   titulo: '4. Finalidad',          icono: '🎯' },
  { id: 'conservacion',titulo: '5. Conservación',       icono: '⏳' },
  { id: 'seguridad',   titulo: '6. Seguridad',          icono: '🔒' },
  { id: 'derechos',    titulo: '7. Tus Derechos',       icono: '⚖️' },
  { id: 'contacto',    titulo: '8. Contacto',           icono: '📞' },
  { id: 'resumen',     titulo: 'Resumen Rápido',        icono: '📋' },
];

export default function DataPolicyNotice({ accepted, onAcceptedChange }: DataPolicyNoticeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('intro');

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Checkbox de aceptación */}
      <div className="flex items-start gap-2 text-sm">
        <label
          htmlFor="dataPolicyAccepted"
          className="flex cursor-pointer items-start gap-2 text-gray-200"
        >
          <input
            id="dataPolicyAccepted"
            type="checkbox"
            checked={accepted}
            onChange={(event) => onAcceptedChange(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-secondary focus:ring-secondary/50"
            required
          />
          <span className="font-noto-serif font-light">
            Acepto el tratamiento de mis datos conforme a la información proporcionada.
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-1 ml-6 font-noto-serif font-light text-secondary underline underline-offset-2 hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-colors"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        Consultar política de datos
      </button>

      {/* Modal */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            className="relative w-[90vw] max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-black/80 shadow-2xl shadow-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="data-policy-title"
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="data-policy-title"
                    className="font-noto-serif text-xl font-normal text-white"
                  >
                    Política de Tratamiento de Datos
                  </h2>
                  <p className="text-xs text-gray-400 font-noto-serif font-extralight">
                    La Palmera Coacalco · Versión 1.0 · Última actualización: septiembre 2026
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
                aria-label="Cerrar política de datos"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            {/* Contenido: sidebar + sección activa */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <aside className="hidden w-64 overflow-y-auto border-r border-white/10 p-4 md:block">
                <nav className="space-y-1">
                  {SECCIONES.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSeccionActiva(sec.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors font-noto-serif ${
                        seccionActiva === sec.id
                          ? 'bg-secondary/20 text-secondary font-normal'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white font-extralight'
                      }`}
                    >
                      <span aria-hidden="true">{sec.icono}</span>
                      <span className="truncate">{sec.titulo}</span>
                    </button>
                  ))}
                </nav>
              </aside>

              {/* Contenido de la sección activa */}
              <div className="flex-1 overflow-y-auto p-6">
                <ContenidoSeccion seccion={seccionActiva} />
              </div>
            </div>

            {/* Footer */}
            <footer className="flex flex-col items-start justify-between gap-4 border-t border-white/10 bg-black/40 p-6 sm:flex-row sm:items-center">
              <p className="text-xs text-gray-400 font-noto-serif font-extralight">
                Al aceptar, confirmas que has leído y comprendido esta política.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-white/20 px-4 py-2 font-noto-serif text-sm font-light text-gray-200 transition-colors hover:bg-white/10"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAcceptedChange(true);
                    setIsOpen(false);
                  }}
                  className="rounded-lg bg-secondary px-6 py-2 font-noto-serif text-sm font-normal text-black transition-colors hover:bg-primary hover:text-secondary"
                >
                  Aceptar y continuar
                </button>
              </div>
            </footer>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

// ============================================
//  CONTENIDO DE CADA SECCIÓN
// ============================================

const CLASES = {
  h3: 'font-noto-serif text-lg font-normal text-white mb-3',
  h4: 'font-noto-serif text-base font-normal text-gray-200 mt-4 mb-2',
  p: 'font-noto-serif text-sm font-extralight text-gray-300 leading-relaxed mb-3',
  ul: 'font-noto-serif text-sm font-extralight text-gray-300 space-y-1 mb-3 ml-4',
  tabla: 'w-full border-collapse text-sm mb-4',
  th: 'border border-white/10 bg-white/5 px-3 py-2 text-left font-noto-serif text-xs font-normal text-white',
  td: 'border border-white/10 px-3 py-2 font-noto-serif text-xs font-extralight text-gray-300',
  cajaVerde:
    'mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4',
  cajaRoja:
    'mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4',
  cajaAzul:
    'mb-4 rounded-lg border border-secondary/30 bg-secondary/10 p-4',
};

function ContenidoSeccion({ seccion }: { seccion: string }) {
  switch (seccion) {
    case 'intro':
      return (
        <div>
          <h3 className={CLASES.h3}>1. Introducción</h3>
          <p className={CLASES.p}>
            En <strong className="text-white font-normal">La Palmera Coacalco</strong> nos
            comprometemos a proteger la información personal que compartes con nosotros al
            crear una cuenta, solicitar información o contratar nuestros servicios.
          </p>

          <div className={CLASES.cajaVerde}>
            <h4 className="mb-2 font-noto-serif text-base font-normal text-green-300">
              ✅ Nuestro compromiso
            </h4>
            <ul className="space-y-1 text-sm font-noto-serif font-extralight text-green-100">
              <li>• Transparencia total sobre qué datos recopilamos.</li>
              <li>• Control del usuario sobre su información.</li>
              <li>• Sin venta de datos a terceros bajo ninguna circunstancia.</li>
              <li>• Uso exclusivo para la operación y mejora del servicio.</li>
            </ul>
          </div>

          <p className={CLASES.p}>
            Al registrarte y usar este sitio, aceptas las prácticas descritas en esta política.
          </p>
        </div>
      );

    case 'responsable':
      return (
        <div>
          <h3 className={CLASES.h3}>2. Responsable del tratamiento</h3>
          <p className={CLASES.p}>
            El responsable del tratamiento de tus datos es{' '}
            <strong className="text-white font-normal">La Palmera Coacalco</strong>, con
            domicilio en Coacalco, Estado de México, y contacto a través de los canales
            oficiales del sitio.
          </p>
          <div className={CLASES.cajaAzul}>
            <p className="font-noto-serif text-sm font-extralight text-green-300">
              <strong className="font-normal">Nota:</strong> Si contactas a través de
              formularios o correo electrónico, los datos que proporciones serán tratados
              únicamente por el equipo de La Palmera Coacalco.
            </p>
          </div>
        </div>
      );

    case 'datos':
      return (
        <div>
          <h3 className={CLASES.h3}>3. Datos que recopilamos</h3>

          <h4 className={CLASES.h4}>3.1 Datos de registro</h4>
          <table className={CLASES.tabla}>
            <thead>
              <tr>
                <th className={CLASES.th}>Dato</th>
                <th className={CLASES.th}>Obligatorio</th>
                <th className={CLASES.th}>Finalidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={CLASES.td}>Nombre o display name</td>
                <td className={CLASES.td}>Sí</td>
                <td className={CLASES.td}>Identificación</td>
              </tr>
              <tr>
                <td className={CLASES.td}>Correo electrónico</td>
                <td className={CLASES.td}>Sí</td>
                <td className={CLASES.td}>Autenticación y contacto</td>
              </tr>
              <tr>
                <td className={CLASES.td}>Contraseña</td>
                <td className={CLASES.td}>Sí</td>
                <td className={CLASES.td}>Seguridad (hash bcrypt)</td>
              </tr>
              <tr>
                <td className={CLASES.td}>Teléfono y dirección</td>
                <td className={CLASES.td}>Opcional</td>
                <td className={CLASES.td}>Gestión de eventos</td>
              </tr>
            </tbody>
          </table>

          <h4 className={CLASES.h4}>3.2 Datos que NO recopilamos</h4>
          <div className={CLASES.cajaRoja}>
            <ul className="space-y-1 text-sm font-noto-serif font-extralight text-red-100">
              <li>❌ Datos biométricos.</li>
              <li>❌ Información financiera sensible.</li>
              <li>❌ Datos de salud.</li>
              <li>❌ Contactos del teléfono.</li>
            </ul>
          </div>
        </div>
      );

    case 'finalidad':
      return (
        <div>
          <h3 className={CLASES.h3}>4. Finalidad del tratamiento</h3>
          <p className={CLASES.p}>Utilizamos tus datos exclusivamente para:</p>

          <div className={CLASES.cajaVerde}>
            <h4 className="mb-2 font-noto-serif text-base font-normal text-green-300">
              ✅ Lo que SÍ hacemos
            </h4>
            <ul className="space-y-1 text-sm font-noto-serif font-extralight text-green-100">
              <li>• Crear y administrar tu cuenta.</li>
              <li>• Gestionar solicitudes de eventos y cotizaciones.</li>
              <li>• Enviarte notificaciones si las activas.</li>
              <li>• Mejorar la experiencia de navegación del sitio.</li>
            </ul>
          </div>

          <div className={CLASES.cajaRoja}>
            <h4 className="mb-2 font-noto-serif text-base font-normal text-red-300">
              ❌ Lo que NUNCA hacemos
            </h4>
            <ul className="space-y-1 text-sm font-noto-serif font-extralight text-red-100">
              <li>• Vender tu información a terceros.</li>
              <li>• Enviarte spam o publicidad no solicitada.</li>
              <li>• Compartir tus datos con anunciantes.</li>
            </ul>
          </div>
        </div>
      );

    case 'conservacion':
      return (
        <div>
          <h3 className={CLASES.h3}>5. Conservación de los datos</h3>
          <p className={CLASES.p}>
            Conservamos tus datos personales únicamente durante el tiempo necesario para
            cumplir con las finalidades descritas. Una vez que tu cuenta sea eliminada, los
            datos asociados se borrarán de nuestros sistemas en un plazo máximo de{' '}
            <strong className="text-white font-normal">30 días naturales</strong>.
          </p>
          <p className={CLASES.p}>
            Los datos agregados y anonimizados (estadísticas de uso) podrán conservarse por
            tiempo indefinido con fines analíticos.
          </p>
        </div>
      );

    case 'seguridad':
      return (
        <div>
          <h3 className={CLASES.h3}>6. Seguridad</h3>
          <ul className={CLASES.ul}>
            <li>• 🔐 Hash <strong className="text-white font-normal">bcrypt</strong> para contraseñas.</li>
            <li>• 🎫 Tokens <strong className="text-white font-normal">JWT</strong> firmados con HS256.</li>
            <li>• 🔒 Conexiones cifradas mediante <strong className="text-white font-normal">HTTPS</strong>.</li>
            <li>• 🛡️ Almacenamiento en servidores con acceso restringido.</li>
            <li>• 🚫 Sin acceso de terceros a tu información personal.</li>
          </ul>
        </div>
      );

    case 'derechos':
      return (
        <div>
          <h3 className={CLASES.h3}>7. Tus derechos</h3>
          <p className={CLASES.p}>Como titular de los datos, tienes derecho a:</p>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3">
              <h4 className="mb-1 font-noto-serif text-sm font-normal text-secondary">
                🔍 Acceso
              </h4>
              <p className="font-noto-serif text-xs font-extralight text-gray-300">
                Conocer qué datos tenemos sobre ti.
              </p>
            </div>
            <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3">
              <h4 className="mb-1 font-noto-serif text-sm font-normal text-secondary">
                ✏️ Rectificación
              </h4>
              <p className="font-noto-serif text-xs font-extralight text-gray-300">
                Corregir datos inexactos o incompletos.
              </p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <h4 className="mb-1 font-noto-serif text-sm font-normal text-red-300">
                🗑️ Supresión
              </h4>
              <p className="font-noto-serif text-xs font-extralight text-gray-300">
                Solicitar la eliminación de tu cuenta y datos.
              </p>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <h4 className="mb-1 font-noto-serif text-sm font-normal text-green-300">
                📦 Portabilidad
              </h4>
              <p className="font-noto-serif text-xs font-extralight text-gray-300">
                Exportar tu información en formato JSON.
              </p>
            </div>
          </div>

          <p className={CLASES.p}>
            Puedes ejercer estos derechos desde la sección de configuración de tu cuenta o
            contactándonos a través de los canales oficiales.
          </p>
        </div>
      );

    case 'contacto':
      return (
        <div>
          <h3 className={CLASES.h3}>8. Contacto</h3>
          <p className={CLASES.p}>
            Si tienes dudas sobre el tratamiento de tus datos, puedes contactarnos a través de:
          </p>
          <ul className={CLASES.ul}>
            <li>• Correo electrónico: <strong className="text-white font-normal">vg.eventos.planner@gmail.com</strong></li>
            <li>• Formulario de contacto en este sitio.</li>
            <li>• Teléfono y dirección publicados en el sitio.</li>
          </ul>
        </div>
      );

    case 'resumen':
      return (
        <div>
          <h3 className={CLASES.h3}>📋 Resumen rápido</h3>
          <p className={CLASES.p}>
            Si solo tienes 30 segundos, esto es lo más importante:
          </p>

          <div className="space-y-2">
            {[
              { icon: '❌', q: '¿Venden mis datos?', a: 'NUNCA', color: 'text-green-400' },
              { icon: '❌', q: '¿Los comparten con terceros?', a: 'NO', color: 'text-green-400' },
              { icon: '✅', q: '¿Se almacenan de forma segura?', a: 'SÍ', color: 'text-secondary' },
              { icon: '✅', q: '¿Puedo eliminar mi cuenta?', a: 'SÍ', color: 'text-secondary' },
              { icon: '✅', q: '¿Puedo exportar mis datos?', a: 'SÍ', color: 'text-secondary' },
              { icon: '❌', q: '¿Usan cookies de terceros?', a: 'NO', color: 'text-green-400' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg bg-white/5 p-3"
              >
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <div>
                  <div className="font-noto-serif text-sm font-normal text-white">
                    {item.q}
                  </div>
                  <div className={`font-noto-serif text-xs font-light ${item.color}`}>
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}