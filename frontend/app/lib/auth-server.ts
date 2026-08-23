// lib/auth-server.ts
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/api/client';

// ✅ Solo para Server Components (páginas, layouts, middleware)
export async function getServerToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

export async function fetchProtectedData<T = any>(url: string): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No autorizado');

  // `getApiBaseUrl()` usa la URL interna de Docker (API_URL_INTERNAL) al ejecutarse
  // en el servidor; `NEXT_PUBLIC_API_URL` (localhost) solo es alcanzable desde el
  // navegador, nunca desde dentro del contenedor del frontend.
  const response = await fetch(`${getApiBaseUrl()}${url}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Token inválido o expirado');
    throw new Error(`Error ${response.status}`);
  }

  return response.json();
}

export async function isAuthenticated(): Promise<boolean> {
  return !!(await getServerToken());
}