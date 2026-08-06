import { Space, SpaceCreate, SpaceUpdate } from '@/src/types/services';
import { getApiBaseUrl } from './client';

export async function getSpaces(
  params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    search?: string;
  },
  token?: string
): Promise<Space[]> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.is_active !== undefined) query.append('is_active', params.is_active.toString());
  if (params?.search) query.append('search', params.search);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/spaces?${query.toString()}`, {
    headers,
    credentials: token ? undefined : 'include', // si usamos token en header, no necesitamos credentials
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error status:', res.status);
    console.error('Error body:', errorText);
    throw new Error(`Error al cargar espacios: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function getSpace(id: number): Promise<Space> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/spaces/${id}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Espacio no encontrado');
  return res.json();
}

export async function createSpace(data: SpaceCreate): Promise<Space> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/spaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear espacio');
  }
  return res.json();
}

export async function updateSpace(id: number, data: SpaceUpdate): Promise<Space> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/spaces/${id}`, {
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
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/spaces/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar espacio');
  }
}