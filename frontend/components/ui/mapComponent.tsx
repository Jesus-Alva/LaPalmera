// components/MapComponent.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression, Icon } from 'leaflet';

// Componentes de react-leaflet importados dinámicamente
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface MapComponentProps {
  position: LatLngExpression;
  zoom?: number;
}

const MapComponent = ({ position, zoom = 15 }: MapComponentProps) => {
  const [customIcon, setCustomIcon] = useState<Icon | null>(null);

  useEffect(() => {
    // Importamos Leaflet de forma dinámica solo en el cliente
    import('leaflet').then((L) => {
      // Creamos el icono con las URLs CDN
      const icon = L.icon({
        iconUrl: '/images/identidad/marcador.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [40, 60],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      setCustomIcon(icon);
    });
  }, []);

  if (!customIcon) {
    // Mostramos un placeholder mientras se carga el icono
    return <div className="h-96 w-full bg-gray-200 animate-pulse rounded-lg" />;
  }

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      style={{ height: '400px', width: '100%' }}
      className="z-0 rounded-lg shadow-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={customIcon}>
        <Popup>
          📍 ¡Estamos aquí! <br />
          <strong>Ubicación principal</strong>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;