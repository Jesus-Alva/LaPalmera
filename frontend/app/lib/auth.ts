// lib/auth-client.ts
// ✅ Solo para Client Components (no usa next/headers)

export function getClientToken() {
  // Si usaras localStorage (no recomendado para tokens sensibles)
  // return localStorage.getItem('access_token');
  // Pero como usas cookies HttpOnly, no puedes leer desde JS.
  // Las peticiones desde el cliente deben usar credentials: 'include'
  return null;
}

// Función para hacer fetch desde cliente (con credentials)
export async function fetchClientData(url: string, options?: RequestInit) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    credentials: 'include', // <- esto envía la cookie automáticamente
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('No autorizado');
    throw new Error(`Error ${response.status}`);
  }

  return response.json();
}