import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export interface RegisterUserData {
  email: string;
  password: string;
  display_name?: string;
  phone?: string;
  address?: string;
  notifications_enabled: boolean;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  access_token: string;
  token_type?: string;
}

export class AuthApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export async function registerUser(data: RegisterUserData): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.detail || 'Error al registrar usuario');
  }
}

export async function loginUser(data: LoginUserData): Promise<LoginUserResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  let responseData: Partial<LoginUserResponse> & { detail?: string };
  try {
    responseData = JSON.parse(text);
  } catch {
    throw new AuthApiError(text || 'Error del servidor', res.status || 500);
  }

  if (!res.ok) {
    throw new AuthApiError(responseData.detail || 'Credenciales incorrectas', res.status);
  }

  if (!responseData.access_token) {
    throw new AuthApiError('Respuesta de autenticación inválida', 502);
  }

  return responseData as LoginUserResponse;
}

export async function logoutUser(): Promise<void> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!res.ok) {
    throw new AuthApiError('Error al cerrar sesión', res.status);
  }
}
