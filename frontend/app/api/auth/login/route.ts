import { NextRequest, NextResponse } from 'next/server';
import { AuthApiError, loginUser } from '@/lib/api/auth';
import { decodeJwtPayload } from '@/lib/jwt';

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

    const data = await loginUser({ email, password });

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
  } catch (error: unknown) {
    console.error('Error en API route:', error);
    if (error instanceof AuthApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}