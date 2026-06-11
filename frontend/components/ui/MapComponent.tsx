// components/MapComponent.tsx
'use client';

interface MapComponentProps {
  zoom?: number;
}

const MapComponent = ({ zoom = 15 }: MapComponentProps) => {
  return (
    <section className="w-full rounded-2xl">
      {/* Contenedor con posición relativa y relación de aspecto 16:9 (aspect-video) */}
      <div className="relative w-full aspect-video">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19830.211817387943!2d-99.09388497074438!3d19.626179497465653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1f50002077d9d%3A0x11d220b479a0566d!2sLa%20Palmera%20-%20Jard%C3%ADn%20de%20eventos%20Coacalco!5e1!3m2!1ses!2smx!4v1781149946695!5m2!1ses!2smx"
          className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
};

export default MapComponent;