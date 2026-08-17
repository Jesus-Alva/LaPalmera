// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // Rutas protegidas (comienzan con /dashboard)
  if (request.nextUrl.pathname.startsWith('/spaces')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si el usuario tiene token y va a login, redirigir a dashboard
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/spaces', request.url));
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
  ],
};