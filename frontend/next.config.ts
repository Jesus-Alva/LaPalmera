import type { NextConfig } from "next";

// El backend sirve las imágenes subidas (galería, banners, etc.) bajo /static.
// next/image valida el host de cualquier imagen remota contra `remotePatterns`
// antes de optimizarla, así que el dominio real del backend en producción debe
// estar en esta lista — antes estaba fijo a "localhost:8000" y las imágenes se
// habrían rechazado al desplegar. Se deriva de NEXT_PUBLIC_API_URL para no
// duplicar el dominio en dos lugares distintos.
function backendRemotePattern() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const { protocol, hostname, port } = new URL(apiUrl);
  return {
    protocol: protocol.replace(':', '') as 'http' | 'https',
    hostname,
    ...(port ? { port } : {}),
    pathname: '/static/**' as const,
  };
}

const nextConfig: NextConfig = {
  // Eliminada la sección turbopack con watchOptions
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      backendRemotePattern(),
    ],
  },
  experimental: {
    useLightningcss: false
  }
};

export default nextConfig;