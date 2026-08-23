// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwtPayload } from './lib/jwt';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const role = token ? decodeJwtPayload<{ role?: string }>(token)?.role : undefined;
  // Todo usuario recién registrado inicia con este rol (ver backend/app/api/v1/endpoint/auth.py)
  // y solo debe poder ver el sitio público, no el panel de administración.
  const isReadOnly = role === 'read';
  const { pathname } = request.nextUrl;

  // Rutas protegidas (comienzan con /dashboard)
  if (pathname.startsWith('/spaces')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Un rol de solo lectura no debe entrar al panel de administración
  if (token && isReadOnly && pathname !== '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si el usuario tiene token y va a login, redirigir según su rol
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL(isReadOnly ? '/' : '/spaces', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/spaces/:path*',
    '/celebrations/:path*',
    '/locations/:path*',
    '/team-members/:path*',
    '/banners/:path*',
    '/faqs/:path*',
    '/packages/:path*',
    '/login',
    '/gallery/:path*',
    '/users/:path*',
    '/settings/:path*',
  ],
};