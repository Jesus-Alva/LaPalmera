import { GalleryCategory, GalleryImage, GalleryCategoryCreate, GalleryCategoryUpdate, GalleryImageUpdate } from '@/src/types/gallery';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

// ============ CATEGORÍAS ============
export async function getCategories(token?: string): Promise<GalleryCategory[]> {
  const res = await fetch(`${API_URL}/gallery/categories`, {
    ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function createCategory(data: GalleryCategoryCreate): Promise<GalleryCategory> {
  const res = await fetch(`${API_URL}/gallery/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear categoría');
  }
  return res.json();
}

export async function updateCategory(id: number, data: GalleryCategoryUpdate): Promise<GalleryCategory> {
  const res = await fetch(`${API_URL}/gallery/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar categoría');
  }
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/gallery/categories/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar categoría');
  }
}

// ============ IMÁGENES ============
export async function getImages(token: string | undefined, categoryId?: number): Promise<GalleryImage[]> {
  const query = categoryId ? `?category_id=${categoryId}` : '';
  const res = await fetch(`${API_URL}/gallery/images${query}`, {
    ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al cargar imágenes');
  return res.json();
}

export async function uploadImage(formData: FormData): Promise<GalleryImage> {
  const res = await fetch(`${API_URL}/gallery/images`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al subir imagen');
  }
  return res.json();
}

export async function updateImage(id: number, data: GalleryImageUpdate): Promise<GalleryImage> {
  const res = await fetch(`${API_URL}/gallery/images/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar imagen');
  }
  return res.json();
}

export async function deleteImage(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/gallery/images/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar imagen');
  }
}