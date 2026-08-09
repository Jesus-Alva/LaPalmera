import { Space, SpaceCreate, SpaceUpdate } from '@/src/types/services';
import { ImageType } from '@/src/types/images';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

// Para peticiones desde el servidor (SIEMPRE con token en header)
export async function getSpaces(
  params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    search?: string;
  },
  token?: string
): Promise<Space[]> {
  // Si no hay token, no se puede hacer la petición
  if (!token) {
    throw new Error('No autenticado');
  }

  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.is_active !== undefined) query.append('is_active', params.is_active.toString());
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_URL}/spaces?${query.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error status:', res.status);
    console.error('Error body:', errorText);
    throw new Error(`Error al cargar espacios: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function getSpace(id: number, token: string): Promise<Space> {
  if (!token) {
    throw new Error('No autenticado');
  }
  console.log(`Fetching space with ID: ${id} using token: ${token} and the URL: ${API_URL}/spaces/${id}`);
  const res = await fetch(`${API_URL}/spaces/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error status:', res.status);
    console.error('Error body:', errorText);
    throw new Error(`Espacio no encontrado: ${res.status} - ${errorText}`);
  }
  return res.json();
}

// Para peticiones desde el cliente (usando cookies)
export async function createSpace(data: SpaceCreate): Promise<Space> {
  const res = await fetch(`${API_URL}/spaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // La cookie se envía automáticamente
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear espacio');
  }
  return res.json();
}

export async function updateSpace(id: number, data: SpaceUpdate): Promise<Space> {
  const res = await fetch(`${API_URL}/spaces/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar espacio');
  }
  return res.json();
}

export async function deleteSpace(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/spaces/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar espacio');
  }
}

export async function uploadSpaceImage(spaceId: number, formData: FormData): Promise<ImageType> {
  const res = await fetch(`${API_URL}/spaces/${spaceId}/images`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al subir imagen');
  }
  return res.json();
}

export async function deleteSpaceImage(spaceId: number, imageId: number): Promise<void> {
  const res = await fetch(`${API_URL}/spaces/${spaceId}/images/${imageId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar imagen');
  }
}

export async function getSpaceImages(spaceId: number): Promise<ImageType[]> {
  const res = await fetch(`${API_URL}/spaces/${spaceId}/images`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al cargar imágenes');
  }
  return res.json();
}