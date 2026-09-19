import { Banner, BannerCreate, BannerUpdate } from '@/src/types/banners';
import { ImagesCatalog } from '@/src/types/images';
import {getApiBaseUrl} from './client';

const API_URL = getApiBaseUrl();

export async function getBanners(
  params?: { skip?: number; limit?: number; search?: string },
  token?: string
): Promise<Banner[]> {
  if (!token) throw new Error('No autenticado');

  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_URL}/banners?${query.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al cargar banners: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function getBanner(id: number, token: string): Promise<Banner> {
  if (!token) throw new Error('No autenticado');

  const res = await fetch(`${API_URL}/banners/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Banner no encontrado: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function createBanner(data: BannerCreate): Promise<Banner> {
  const res = await fetch(`${API_URL}/banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear banner');
  }
  return res.json();
}

export async function updateBanner(id: number, data: BannerUpdate): Promise<Banner> {
  const res = await fetch(`${API_URL}/banners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar banner');
  }
  return res.json();
}

export async function deleteBanner(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/banners/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar banner');
  }
}

export async function getBannerCatalog(bannerId: number, token: string): Promise<ImagesCatalog | null> {
  const res = await fetch(`${API_URL}/banners/${bannerId}/catalog`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al obtener catálogo: ${res.status} - ${error}`);
  }
  return res.json();
}

// Crear/obtener catálogo
export async function getOrCreateBannerCatalog(bannerId: number): Promise<ImagesCatalog> {
  const res = await fetch(`${API_URL}/banners/${bannerId}/catalog`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear/obtener catálogo');
  }
  return res.json();
}

export async function getOrCreateCatalogForBanner(bannerId: number): Promise<ImagesCatalog> {
  const res = await fetch(`${API_URL}/banners/${bannerId}/catalog`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al obtener/crear catálogo');
  }

  const data = await res.json();
  console.log('📦 Catálogo obtenido:', data); // Debug
  return data;
}