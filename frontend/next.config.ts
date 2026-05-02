import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de Turbopack (NUEVA sintaxis en Next.js 16)
  turbopack: {
    watchOptions: {
      usePolling: true,   // Habilita polling para Docker
      interval: 400,      // Intervalo en ms (opcional)
    },
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
  },
};

export default nextConfig;