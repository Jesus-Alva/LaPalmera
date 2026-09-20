import { GalleryCategory, GalleryImage, GalleryCategoryCreate, GalleryCategoryUpdate, GalleryImageUpdate } from '@/src/types/gallery';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

// ============ CATEGORÍAS ============
export async function getCategories(token: string): Promise<GalleryCategory[]> {
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/gallery/categories`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function createCategory(data: GalleryCategoryCreate, token: string): Promise<GalleryCategory> {
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/gallery/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear categoría');
  }
  return res.json();
}

export async function updateCategory(id: number, data: GalleryCategoryUpdate, token: string): Promise<GalleryCategory> {
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/gallery/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar categoría');
  }
  return res.json();
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/gallery/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar categoría');
  }
}

// ============ IMÁGENES ============
export async function getImages(token: string, categoryId?: number): Promise<GalleryImage[]> {
  if (!token) throw new Error('No autenticado');
  const query = categoryId ? `?category_id=${categoryId}` : '';
  const res = await fetch(`${API_URL}/gallery/images${query}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al cargar imágenes');
  return res.json();
}

export async function uploadImage(formData: FormData, token: string): Promise<GalleryImage> {
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/gallery/images`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al subir imagen');
  }
  return res.json();
}

export async function updateImage(id: number, data: GalleryImageUpdate, token: string): Promise<GalleryImage> {
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/gallery/images/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar imagen');
  }
  return res.json();
}

export async function deleteImage(id: number, token: string): Promise<void> {
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/gallery/images/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar imagen');
  }
}