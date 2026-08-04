import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL_INTERNAL || 'http://web:8000/api/v1';

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

    // Éxito: guardar token en cookie
    const response = NextResponse.json({ success: true });
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