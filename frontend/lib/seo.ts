import type { Metadata } from 'next';
import { getPublicSettings } from './api/public';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const DEFAULT_TITLE = 'La Palmera';
const DEFAULT_DESCRIPTION = 'Jardín de Eventos La Palmera';

interface PageMetadataOptions {
  /** Título específico de la página. Si no se define, cae al `meta_title` de site_settings. */
  title?: string;
  /** Descripción específica de la página. Si no se define, cae al `meta_description` de site_settings. */
  description?: string;
  /** Ruta de la página (ej. "/package"), usada para armar la URL canónica y de Open Graph. */
  path?: string;
  /** Imagen para Open Graph/Twitter. Si no se define, cae al `og_image` de site_settings. */
  image?: string;
}

/**
 * Arma el objeto Metadata de una página pública, combinando lo específico de esa
 * página con la configuración global registrada en site_settings (secciones
 * `seo` y `branding`, editables desde /settings). Se consulta el endpoint
 * público (sin autenticación) en cada request; si no responde, se cae a los
 * valores por defecto para no romper el renderizado de la página.
 */
export async function buildPageMetadata(options: PageMetadataOptions = {}): Promise<Metadata> {
  let siteName = DEFAULT_TITLE;
  let seoTitle: string | undefined;
  let seoDescription: string | undefined;
  let seoKeywords: string | undefined;
  let seoImage: string | undefined;

  try {
    const settings = await getPublicSettings();
    siteName = settings.branding?.site_name || DEFAULT_TITLE;
    seoTitle = settings.seo?.meta_title;
    seoDescription = settings.seo?.meta_description;
    seoKeywords = settings.seo?.keywords;
    seoImage = settings.seo?.og_image;
  } catch {
    // Si /public/settings no responde, la página sigue funcionando con los valores por defecto.
  }

  const title = options.title || seoTitle || DEFAULT_TITLE;
  const description = options.description || seoDescription || DEFAULT_DESCRIPTION;
  const path = options.path || '/';
  const canonicalUrl = `${SITE_URL}${path}`;

  const imagePath = options.image || seoImage;
  const imageUrl = imagePath
    ? (imagePath.startsWith('http') ? imagePath : `${SITE_URL}${imagePath}`)
    : undefined;

  return {
    title,
    description,
    keywords: seoKeywords || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'es_MX',
      type: 'website',
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
