import { Image, ImagesCatalog } from '@/src/types/images';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export async function getCatalogBySpace(spaceId: number): Promise<ImagesCatalog | null> {
  const res = await fetch(`${API_URL}/images/catalogs/space/${spaceId}`, {
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getOrCreateCatalog(spaceId: number): Promise<ImagesCatalog> {
  const res = await fetch(`${API_URL}/images/catalogs/space/${spaceId}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al crear/obtener catálogo');
  return res.json();
}

export async function uploadImage(
  catalogId: number,
  file: File,
  altText?: string
): Promise<Image> {
  const formData = new FormData();
  formData.append('catalog_id', catalogId.toString());
  formData.append('file', file);
  if (altText) formData.append('alt_text', altText);

  const res = await fetch(`${API_URL}/images/upload`, {
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

export async function deleteImage(imageId: number): Promise<void> {
  const res = await fetch(`${API_URL}/images/${imageId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar imagen');
  }
}