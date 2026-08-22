import { User, UserAdminUpdate } from '@/src/types/user';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export async function getUsers(
  params?: { skip?: number; limit?: number; search?: string },
  token?: string
): Promise<User[]> {
  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_URL}/user/?${query.toString()}`, {
    ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al cargar usuarios: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function updateUser(id: number, data: UserAdminUpdate): Promise<User> {
  const res = await fetch(`${API_URL}/user/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar el usuario');
  }
  return res.json();
}
