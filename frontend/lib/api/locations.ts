import { Location, LocationCreate, LocationUpdate } from '@/src/types/location';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export async function getLocations(
  params?: { skip?: number; limit?: number; is_active?: boolean; search?: string },
  token?: string
): Promise<Location[]> {
  if (!token) throw new Error('No autenticado');

  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.is_active !== undefined) query.append('is_active', params.is_active.toString());
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_URL}/locations?${query.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al cargar ubicaciones');
  return res.json();
}

export async function getLocation(id: number, token: string): Promise<Location> {
  const res = await fetch(`${API_URL}/locations/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ubicación no encontrada');
  return res.json();
}

export async function createLocation(data: LocationCreate): Promise<Location> {
  const res = await fetch(`${API_URL}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear ubicación');
  }
  return res.json();
}

export async function updateLocation(id: number, data: LocationUpdate): Promise<Location> {
  const res = await fetch(`${API_URL}/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar ubicación');
  }
  return res.json();
}

export async function deleteLocation(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/locations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar ubicación');
  }
}