// src/components/Location/LocationComponent.tsx
'use client';

import { useTranslation } from "../../../lib/hooks/useTranslation";
import MapComponent from "../../ui/MapComponent";


const LocationComponent: React.FC = () => {
  const { t } = useTranslation();
  // Definimos las coordenadas una sola vez para reusarlas
  const coordinates: [number, number] = [19.628822086036738, -99.10634857502177];

  return (
    <section className="px-4 py-12 mt-18.75 ">
      <div className="container mx-auto">
        {/* Cambiamos el grid para que sea responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          
          {/* Columna izquierda con la información */}
          <div className="md:col-span-2">
            <p className="font-manrope font-bold uppercase tracking-widest text-start text-yellow-800 mb-4">
              {t('inicio.location.desc')}
            </p>
            <h2 className="font-noto-serif text-5xl font-normal text-start text-gray-800 mb-12">
              {t('inicio.location.title')}
            </h2>
            <span className="font-noto-serif text-3xl tracking-wider">
              {t('inicio.location.address')} <br />
            </span>
            {/* Botón actualizado para abrir Google Maps en una nueva pestaña */}
            <a
              href={`https://www.google.com/maps/place/La+Palmera+-+Jard%C3%ADn+de+eventos+Coacalco/@19.6287575,-99.1061957,117m/data=!3m1!1e3!4m12!1m5!3m4!2zMTnCsDM3JzQzLjgiTiA5OcKwMDYnMjIuOSJX!8m2!3d19.6288221!4d-99.1063486!3m5!1s0x85d1f50002077d9d:0x11d220b479a0566d!8m2!3d19.628645!4d-99.106267!16s%2Fg%2F11w9k1bhlk?entry=ttu&g_ep=EgoyMDI2MDUxMS4wIKXMDSoASAFQAw%3D%3D`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-noto-serif border border-secondary text-secondary hover:bg-secondary hover:text-primary transition-colors duration-300 mt-5 p-5"
            >
              Ver en Google Maps
            </a>
          </div>

          {/* Columna derecha con el mapa de Leaflet */}
          <div className="md:col-span-4">
            <MapComponent position={coordinates} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationComponent;