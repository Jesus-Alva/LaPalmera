import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api/client';
import { decodeJwtPayload } from '@/lib/jwt';

const API_URL = getApiBaseUrl();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validar que hay email y password
    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Llamar al backend
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // Leer la respuesta como texto primero
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // Si no es JSON, devolver error
      return NextResponse.json(
        { detail: text || 'Error del servidor' },
        { status: res.status || 500 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Credenciales incorrectas' },
        { status: res.status }
      );
    }

    // Éxito: guardar token en cookie. Se devuelve el rol (no el token, que va en
    // una cookie httpOnly) para que el cliente sepa a dónde redirigir sin rebotar
    // primero por el panel de administración.
    const role = decodeJwtPayload<{ role?: string }>(data.access_token)?.role;
    const response = NextResponse.json({ success: true, role });
    response.cookies.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30, // 30 minutos
    });
    return response;
  } catch (error: any) {
    console.error('Error en API route:', error);
    return NextResponse.json(
      { detail: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}