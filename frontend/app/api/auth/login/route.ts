import { NextRequest, NextResponse } from 'next/server';
import { decodeJwtPayload } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Llamar directamente al backend
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Credenciales incorrectas' },
        { status: backendRes.status }
      );
    }

    const role = decodeJwtPayload<{ role?: string }>(data.access_token)?.role;
    const response = NextResponse.json({ success: true, role });

    // 1. Cookie para el frontend (para el middleware)
    response.cookies.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30,
    });

    // 2. Propagar el Set-Cookie del backend (para el dominio del backend)
    const setCookieHeader = backendRes.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.append('set-cookie', setCookieHeader);
    }

    return response;
  } catch (error: unknown) {
    console.error('Error en API route login:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}