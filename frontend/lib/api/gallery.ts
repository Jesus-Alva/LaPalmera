// lib/api/gallery.ts
import { GalleryCategory, GalleryImage, GalleryCategoryCreate, GalleryCategoryUpdate } from '@/src/types/gallery';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ============ CATEGORÍAS ============
export async function getCategories(token: string, params?: { search?: string }): Promise<GalleryCategory[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_URL}/gallery/categories?${query.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function getCategory(id: number, token: string): Promise<GalleryCategory> {
  const res = await fetch(`${API_URL}/gallery/categories/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Categoría no encontrada');
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

// ============ IMÁGENES DE GALERÍA ============
export async function uploadGalleryImage(
  categoryId: number,
  file: File,
  altText?: string
): Promise<GalleryImage> {
  const formData = new FormData();
  formData.append('category_id', categoryId.toString());
  formData.append('file', file);
  if (altText) formData.append('alt_text', altText);

  const res = await fetch(`${API_URL}/gallery/images/upload`, {
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

export async function deleteGalleryImage(imageId: number): Promise<void> {
  const res = await fetch(`${API_URL}/gallery/images/${imageId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar imagen');
  }
}

export async function updateGalleryImage(imageId: number, data: { alt_text?: string; sort_order?: number }): Promise<GalleryImage> {
  const res = await fetch(`${API_URL}/gallery/images/${imageId}`, {
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