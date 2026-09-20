// components/seo/JsonLd.tsx
import { getPublicSettings } from '@/lib/api/public';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function JsonLd() {
  const settings = await getPublicSettings();

  const siteName = settings.branding?.site_name || 'La Palmera';
  const contactInfo = settings.contact_info || [];
  const schedule = settings.schedule || [];
  const social = settings.social_networks || {};
  const ogImage = settings.seo?.og_image;

  // Extrae los datos del formato [{title, value}] de site_settings
  const findContact = (keyword: string) =>
    contactInfo.find((c) => c.title.toLowerCase().includes(keyword))?.value;

  const address = findContact('direcci');
  const phone = findContact('tel');
  const email = findContact('correo');

  // Convierte los horarios de texto a formato Schema.org
  // Ajusta según cómo tengas estructurado el schedule
  const openingHours = schedule.map((s) => ({
    '@type': 'OpeningHoursSpecification',
    name: s.days,
    description: s.time,
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EventVenue', // Tipo específico para salones/jardines de eventos
    '@id': `${SITE_URL}/#venue`,
    name: siteName,
    description: settings.seo?.meta_description || 'Jardín de eventos en Coacalco',
    url: SITE_URL,
    telephone: phone,
    email: email,
    address: address
      ? {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Coacalco de Berriozábal',
          addressRegion: 'Estado de México',
          addressCountry: 'MX',
        }
      : undefined,
    image: ogImage
      ? ogImage.startsWith('http')
        ? ogImage
        : `${SITE_URL}${ogImage}`
      : undefined,
    logo: settings.branding?.logo_url
      ? `${SITE_URL}${settings.branding.logo_url}`
      : undefined,
    priceRange: '$$',
    openingHoursSpecification: openingHours.length > 0 ? openingHours : undefined,
    sameAs: Object.values(social).filter(Boolean),
    areaServed: {
      '@type': 'City',
      name: 'Coacalco de Berriozábal',
    },
    // Si tienes coordenadas GPS, añádelas aquí:
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.628645,
      longitude: -99.106267,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}