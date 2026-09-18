import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo';

// Rutas públicas del sitio. No incluye /dashboard (contenido duplicado de "/",
// ver app/robots.ts) ni las rutas del panel de administración.
const PUBLIC_ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/package', priority: 0.8 },
  { path: '/gallery', priority: 0.7 },
  { path: '/aboutus', priority: 0.6 },
  { path: '/contact', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority,
  }));
}
