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

export async function uploadImage(catalogId: number, file: File, altText?: string): Promise<Image> {
  if (!catalogId || isNaN(catalogId)) {
    throw new Error('catalogId no es válido');
  }

  const formData = new FormData();
  // IMPORTANTE: usar string para catalog_id y append con nombre exacto
  formData.append('catalog_id', String(catalogId));
  formData.append('file', file, file.name);
  if (altText) {
    formData.append('alt_text', altText);
  }

  // Debug: ver qué contiene el FormData
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

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

export async function getOrCreateCatalogForBanner(bannerId: number): Promise<ImagesCatalog> {
  const res = await fetch(`${API_URL}/images/catalogs/banner/${bannerId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al obtener/crear catálogo para banner');
  }
  return res.json();
}

export async function getOrCreateCatalogForPackage(packageId: number): Promise<ImagesCatalog> {
  const res = await fetch(`${API_URL}/images/catalogs/package/${packageId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al obtener/crear catálogo para paquete');
  }
  return res.json();
}

export async function getCatalogByPackageId(packageId: number): Promise<ImagesCatalog | null> {
  const res = await fetch(`${API_URL}/images/catalogs/package/${packageId}`, {
    credentials: 'include',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al obtener catálogo');
  }
  return res.json();
}
