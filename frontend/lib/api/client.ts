// lib/api/client.ts

/**
 * Determina la URL base de la API según el entorno de ejecución.
 * - En el servidor (Server Components, API routes): usa API_URL_INTERNAL (http://web:8000/api/v1)
 * - En el cliente (navegador): usa NEXT_PUBLIC_API_URL (http://localhost:8000/api/v1)
 */
export function getApiBaseUrl(): string {
  // Si estamos en el servidor, usamos la variable interna
  if (typeof window === 'undefined') {
    return process.env.API_URL_INTERNAL || 'http://web:8000/api/v1';
  }
  // En el cliente, usamos la variable pública
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}