import { Banner } from '@/src/types/banners';
import { Space } from '@/src/types/space';
import { Celebration } from '@/src/types/celebration';
import { Package } from '@/src/types/package';
import { Location } from '@/src/types/location';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

/**
 * Funciones de solo lectura para el sitio público (home, etc).
 * Consumen los endpoints /public/* del backend, que no requieren autenticación.
 */

export async function getPublicBanners(): Promise<Banner[]> {
  const res = await fetch(`${API_URL}/public/banners`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar banners');
  return res.json();
}

export async function getPublicSpaces(): Promise<Space[]> {
  const res = await fetch(`${API_URL}/public/spaces`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar espacios');
  return res.json();
}

export async function getPublicCelebrations(): Promise<Celebration[]> {
  const res = await fetch(`${API_URL}/public/celebrations`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar celebraciones');
  return res.json();
}

export async function getPublicPackages(params?: { celebration_id?: number }): Promise<Package[]> {
  const query = new URLSearchParams();
  if (params?.celebration_id) query.append('celebration_id', params.celebration_id.toString());

  const res = await fetch(`${API_URL}/public/packages?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar paquetes');
  return res.json();
}

export async function getPublicLocations(): Promise<Location[]> {
  const res = await fetch(`${API_URL}/public/locations`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar ubicaciones');
  return res.json();
}
