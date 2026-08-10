import { Celebration, CelebrationCreate, CelebrationUpdate } from '@/src/types/celebration';
import {getApiBaseUrl} from './client';

const API_URL = getApiBaseUrl();

export async function getCelebrations(
  params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    search?: string;
  },
  token?: string
): Promise<Celebration[]> {
  if (!token) throw new Error('No autenticado');

  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.is_active !== undefined) query.append('is_active', params.is_active.toString());
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_URL}/celebrations?${query.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al cargar celebraciones: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function getCelebration(id: number, token: string): Promise<Celebration> {
  if (!token) throw new Error('No autenticado');

  const res = await fetch(`${API_URL}/celebrations/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Celebración no encontrada: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function createCelebration(data: CelebrationCreate): Promise<Celebration> {
  const res = await fetch(`${API_URL}/celebrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear celebración');
  }
  return res.json();
}

export async function updateCelebration(id: number, data: CelebrationUpdate): Promise<Celebration> {
  const res = await fetch(`${API_URL}/celebrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar celebración');
  }
  return res.json();
}

export async function deleteCelebration(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/celebrations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar celebración');
  }
}