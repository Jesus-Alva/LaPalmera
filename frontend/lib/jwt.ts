/**
 * Decodifica el payload de un JWT sin verificar la firma — la verificación real
 * de autenticidad ocurre en el backend en cada endpoint (ver app/core/auth.py).
 * Se usa solo para leer datos no sensibles (rol, nombre) y decidir qué mostrar o
 * a dónde redirigir en el frontend. Funciona tanto en Server Components/Route
 * Handlers (Node) como en middleware (Edge runtime), ya que ambos exponen `atob`.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}
