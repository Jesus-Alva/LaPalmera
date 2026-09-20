import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Panel de administración (protegido por login, pero se excluye igual del rastreo)
        '/banners/',
        '/faqs/',
        '/users/',
        '/packages/',
        '/spaces/',
        '/celebrations/',
        '/locations/',
        '/team-members/',
        '/settings/',
        '/dashboard/',
        '/login',
        '/register',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
