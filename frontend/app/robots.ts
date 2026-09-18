import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Panel de administración (protegido por login, pero se excluye igual del rastreo)
        '/login',
        '/register',
        '/spaces',
        '/celebrations',
        '/locations',
        '/team-members',
        '/banners',
        '/faqs',
        '/packages',
        '/gallery_image',
        '/users',
        '/settings',
        // /dashboard renderiza el mismo contenido que "/" (ver app/dashboard/page.tsx);
        // se excluye para no generar contenido duplicado en el índice.
        '/dashboard',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
