import type { NextConfig } from "next";

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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000', // El puerto donde corre tu backend
        pathname: '/static/**', // La ruta donde se sirven las imágenes
      },
    ],
  },
  experimental: {
    useLightningcss: false
  }
};

export default nextConfig;