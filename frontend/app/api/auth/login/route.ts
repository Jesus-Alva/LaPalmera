import { NextRequest, NextResponse } from 'next/server';
import { decodeJwtPayload } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json();

    if (!access_token) {
      return NextResponse.json({ detail: 'Token requerido' }, { status: 400 });
    }

    const role = decodeJwtPayload<{ role?: string }>(access_token)?.role;
    const response = NextResponse.json({ success: true, role });

    response.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}