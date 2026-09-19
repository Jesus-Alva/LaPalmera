import { Package, PackageCreate, PackageUpdate } from '@/src/types/package';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export async function getPackages(
  token: string,
  params?: {
    skip?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    available_only?: boolean;
  }
): Promise<Package[]> {
  if (!token) throw new Error('No autenticado');
  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.is_active !== undefined) query.append('is_active', params.is_active.toString());
  if (params?.available_only) query.append('available_only', 'true');

  const res = await fetch(`${API_URL}/packages?${query.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al cargar paquetes: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function getPackage(id: number, token: string): Promise<Package> {
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/packages/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Paquete no encontrado: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function createPackage(data: PackageCreate): Promise<Package> {
  const res = await fetch(`${API_URL}/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear paquete');
  }
  return res.json();
}

export async function updatePackage(id: number, data: PackageUpdate): Promise<Package> {
  const res = await fetch(`${API_URL}/packages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar paquete');
  }
  return res.json();
}

export async function deletePackage(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/packages/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar paquete');
  }
}