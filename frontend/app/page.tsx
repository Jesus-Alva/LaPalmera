// app/page.tsx o pages/index.tsx
import type { Metadata } from 'next';
import Page from "./dashboard/page";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata, SITE_URL } from "../lib/seo";
import { getPublicSettings } from "../lib/api/public";
import { SettingValueMap } from "../src/types/siteSettings";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'La Palmera | Jardín de Eventos en Coacalco',
    description: 'La Palmera es un jardín de eventos en Coacalco para bodas, XV años y celebraciones sociales. Espacios, paquetes y atención personalizada para tu evento inolvidable.',
    path: '/',
  });
}

export default async function Home() {
  const settings = await getPublicSettings().catch((): Partial<SettingValueMap> => ({}));
  const contactInfo = settings.contact_info || [];
  const socialNetworks = settings.social_networks;

  const address = contactInfo.find((item) => item.title.toLowerCase().includes('direcci'))?.value;
  const phone = contactInfo.find((item) => item.title.toLowerCase().includes('tel'))?.value;

  return (
    <main className="relative h-full">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'La Palmera',
          description: 'Jardín de eventos para bodas, XV años y celebraciones sociales en Coacalco.',
          url: SITE_URL,
          ...(address ? { address: { '@type': 'PostalAddress', streetAddress: address } } : {}),
          ...(phone ? { telephone: phone } : {}),
          ...(socialNetworks
            ? {
                sameAs: Object.values(socialNetworks).filter((url): url is string => Boolean(url)),
              }
            : {}),
        }}
      />
      <Page />
    </main>
  );
}