import { Banner } from '@/src/types/banners';
import { Space } from '@/src/types/space';
import { Celebration } from '@/src/types/celebration';
import { Package } from '@/src/types/package';
import { Location } from '@/src/types/location';
import { TeamMember } from '@/src/types/teamMember';
import { GalleryCategory, GalleryImage } from '@/src/types/gallery';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

/**
 * Funciones de solo lectura para el sitio público (home, etc).
 * Consumen los endpoints /public/* del backend, que no requieren autenticación.
 */

export async function getPublicBanners(params?: { page?: string }): Promise<Banner[]> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page);

  const res = await fetch(`${API_URL}/public/banners?${query.toString()}`, { cache: 'no-store' });
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

export async function getPublicPackages(params?: { limit?: number }): Promise<Package[]> {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', params.limit.toString());

  const res = await fetch(`${API_URL}/public/packages?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar paquetes');
  return res.json();
}

export async function getPublicLocations(): Promise<Location[]> {
  const res = await fetch(`${API_URL}/public/locations`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar ubicaciones');
  return res.json();
}

export async function getPublicTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch(`${API_URL}/public/team-members`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar el equipo');
  return res.json();
}

export async function getPublicGalleryCategories(): Promise<GalleryCategory[]> {
  const res = await fetch(`${API_URL}/public/gallery/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar categorías de galería');
  return res.json();
}

export async function getPublicGalleryImages(): Promise<GalleryImage[]> {
  const res = await fetch(`${API_URL}/public/gallery/images`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar imágenes de galería');
  return res.json();
}
