// lib/auth-server.ts
import { cookies } from 'next/headers';

// ✅ Solo para Server Components (páginas, layouts, middleware)
export async function getServerToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

export async function fetchProtectedData<T = any>(url: string): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
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