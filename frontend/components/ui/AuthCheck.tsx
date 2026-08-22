'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthCheck({ children, fallback = null }: AuthCheckProps) {
  const pathname = usePathname();

  // Rutas que NO deben mostrar el Navbar
  const protectedPaths = [
    '/spaces',
    '/celebrations',
    '/locations',
    '/team-members',
    '/banners',
    '/faqs',
    '/packages',
    '/dashboard',
    '/gallery_image',
    '/users',
    '/settings',
  ];

  // Verificar si la ruta actual es una ruta protegida
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // Si es una ruta protegida, NO mostrar el Navbar
  if (isProtected) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}