// app/(auth)/layout.tsx
'use client'; // necesario para usePathname

import { usePathname } from 'next/navigation';
import Image from 'next/image';

// Mapa de imágenes por ruta
const backgroundImages: Record<string, string> = {
  '/login': '/images/auth/login_image.png',
  '/register': '/images/auth/register-bg.jpeg',
  // puedes agregar más rutas si es necesario
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bgImage = (pathname && backgroundImages[pathname]) || 'frontend/public/images/auth/default-bg.jpg';

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Imagen de fondo */}
      <Image
        src={bgImage}
        alt="Background"
        fill
        className="object-cover -z-10 opacity-50"
        priority
      />
      {/* Overlay opcional para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/10 -z-10" />

      {/* Contenedor del formulario */}
      <div className="relative z-10 w-full max-w-xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}