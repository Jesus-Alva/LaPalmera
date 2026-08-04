// app/lib/auth.ts
import { cookies } from 'next/headers';

// ✅ Corregido: ahora es async y usa await
export async function getServerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

// ✅ Función para hacer fetch con token (también async)
export async function fetchProtectedData<T = any>(url: string): Promise<T> {
  const token = await getServerToken();
  if (!token) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token inválido o expirado');
    }
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ✅ Opcional: función para verificar si el usuario está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const token = await getServerToken();
  return !!token;
}