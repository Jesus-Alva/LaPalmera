import { Faq, FaqCreate, FaqUpdate } from '@/src/types/faq';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export async function getFaqs(
  token: string,
  params?: { skip?: number; limit?: number; is_active?: boolean; search?: string }
): Promise<Faq[]> {
  if (!token) throw new Error('No autenticado');
  const query = new URLSearchParams();
  if (params?.skip) query.append('skip', params.skip.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.is_active !== undefined) query.append('is_active', params.is_active.toString());
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_URL}/faqs?${query.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar FAQs');
  return res.json();
}

export async function getFaq(id: number, token: string): Promise<Faq> {
  const res = await fetch(`${API_URL}/faqs/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('FAQ no encontrado');
  return res.json();
}

export async function createFaq(data: FaqCreate): Promise<Faq> {
  const res = await fetch(`${API_URL}/faqs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear FAQ');
  }
  return res.json();
}

export async function updateFaq(id: number, data: FaqUpdate): Promise<Faq> {
  const res = await fetch(`${API_URL}/faqs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al actualizar FAQ');
  }
  return res.json();
}

export async function deleteFaq(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/faqs/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar FAQ');
  }
}