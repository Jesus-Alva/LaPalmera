import { TeamMember, TeamMemberCreate, TeamMemberUpdate } from '@/src/types/teamMember';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export async function getTeamMembers(
  params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    search?: string;
  },
  token?: string
): Promise<TeamMember[]> {
  if (!token) throw new Error('No autenticado');

  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.is_active !== undefined) query.append('is_active', params.is_active.toString());
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_URL}/team-members?${query.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al cargar miembros del equipo: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function getTeamMember(id: number, token: string): Promise<TeamMember> {
  if (!token) throw new Error('No autenticado');

  const res = await fetch(`${API_URL}/team-members/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Miembro no encontrado: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function createTeamMember(data: TeamMemberCreate): Promise<TeamMember> {
  const res = await fetch(`${API_URL}/team-members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear miembro');
  }
  return res.json();
}

export async function updateTeamMember(id: number, data: TeamMemberUpdate): Promise<TeamMember> {
  const res = await fetch(`${API_URL}/team-members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar miembro del equipo');
  }
  return res.json();
}

export async function deleteTeamMember(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/team-members/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar miembro del equipo');
  }
}

export async function uploadTeamMemberPhoto(formData: FormData): Promise<{ photo_path: string }> {
  const res = await fetch(`${API_URL}/team-members/upload-photo`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al subir foto');
  }
  return res.json();
}