// lib/api/gallery.ts
import { GalleryCategory, GalleryCategoryCreate, GalleryCategoryUpdate, GalleryImage } from '@/src/types/gallery';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

// ============ CATEGORÍAS ============
// Helper para hacer fetch con token opcional
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    fetchOptions.credentials = 'include';
  }

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Error en la petición');
  }
  return res.json();
}

// ============ CATEGORÍAS ============
export async function getGalleryCategories(
  params?: { skip?: number; limit?: number; search?: string },
  token?: string
): Promise<GalleryCategory[]> {
  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  const url = `${API_URL}/gallery-categories?${query.toString()}`;
  return fetchWithAuth(url, { method: 'GET' }, token);
}

export async function getGalleryCategory(id: number, token?: string): Promise<GalleryCategory> {
  const url = `${API_URL}/gallery-categories/${id}`;
  return fetchWithAuth(url, { method: 'GET' }, token);
}

export async function createGalleryCategory(data: GalleryCategoryCreate, token?: string): Promise<GalleryCategory> {
  const url = `${API_URL}/gallery-categories`;
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function updateGalleryCategory(id: number, data: GalleryCategoryUpdate, token?: string): Promise<GalleryCategory> {
  const url = `${API_URL}/gallery-categories/${id}`;
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
}

export async function deleteGalleryCategory(id: number, token?: string): Promise<void> {
  const url = `${API_URL}/gallery-categories/${id}`;
  await fetchWithAuth(url, { method: 'DELETE' }, token);
}

// ============ IMÁGENES ============
export async function uploadGalleryImage(categoryId: number, file: File, altText?: string, token?: string): Promise<GalleryImage> {
  const formData = new FormData();
  formData.append('category_id', categoryId.toString());
  formData.append('file', file);
  if (altText) formData.append('alt_text', altText);

  const url = `${API_URL}/gallery-images`;
  const headers: HeadersInit = {};
  const fetchOptions: RequestInit = {
    method: 'POST',
    body: formData,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    fetchOptions.headers = headers;
  } else {
    fetchOptions.credentials = 'include';
  }

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Error al subir imagen' }));
    throw new Error(error.detail || 'Error al subir imagen');
  }
  return res.json();
}

export async function deleteGalleryImage(imageId: number, token?: string): Promise<void> {
  const url = `${API_URL}/gallery-images/${imageId}`;
  const headers: HeadersInit = {};
  const fetchOptions: RequestInit = { method: 'DELETE' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    fetchOptions.headers = headers;
  } else {
    fetchOptions.credentials = 'include';
  }

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Error al eliminar imagen' }));
    throw new Error(error.detail || 'Error al eliminar imagen');
  }
}