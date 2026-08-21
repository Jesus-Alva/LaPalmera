// src/components/Location/LocationComponent.tsx
'use client';

import { useTranslation } from "../../../lib/hooks/useTranslation";
import MapComponent from "../../ui/MapComponent";
import { Location } from "../../../src/types/location";

interface ComponentProps {
  location: Location | null;
}

const LocationComponent: React.FC<ComponentProps> = ({ location }) => {
  const { t } = useTranslation();

  const address = location
    ? [location.address_line1, location.address_line2, location.city, location.state].filter(Boolean).join(', ')
    : t('inicio.location.address');
  const mapsUrl = location?.google_maps_url || undefined;
  const lat = location?.latitude ?? undefined;
  const lng = location?.longitude ?? undefined;

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
              {address} <br />
            </span>
            {/* Botón que abre la ubicación (de BD si existe) en Google Maps */}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-noto-serif border border-secondary text-secondary hover:bg-secondary hover:text-primary transition-colors duration-300 mt-5 p-5"
              >
                Ver en Google Maps
              </a>
            )}
          </div>

          {/* Columna derecha con el mapa de Leaflet */}
          <div className="md:col-span-4">
            <MapComponent lat={lat} lng={lng} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationComponent;
