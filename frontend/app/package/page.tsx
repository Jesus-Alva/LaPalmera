import type { Metadata } from 'next';
import BannerComponent from "../../components/features/package/BannerComponent";
import PackagesComponent from "../../components/features/package/PackagesComponent";
import QuestionsComponent from "../../components/features/package/QuestionsComponent";
import JsonLd from "@/components/seo/JsonLd";

import { ROUTES_IMAGES } from "../constants/routes";
import { getPublicPackages, getPublicBanners, getPublicSetting, getPublicFaqs } from "../../lib/api/public";
import { buildPageMetadata, SITE_URL } from "../../lib/seo";
import { extractWhatsAppPhone } from "../../lib/whatsapp";

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${path}`;

export async function generateMetadata(): Promise<Metadata> {
    return buildPageMetadata({
        title: 'Paquetes para Eventos | La Palmera',
        description: 'Conoce los paquetes de La Palmera para bodas, XV años y eventos sociales: espacios, servicios y características incluidas para tu celebración.',
        path: '/package',
    });
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ paquete?: string }>;
}) {
    const [{ paquete }, packages, banners, socialNetworks, faqs] = await Promise.all([
        searchParams,
        getPublicPackages({ limit: 200 }),
        getPublicBanners({ page: "paquetes" }),
        getPublicSetting('social_networks').catch(() => undefined),
        getPublicFaqs().catch(() => undefined)
    ]);
    const whatsappPhone = extractWhatsAppPhone(socialNetworks?.whatsapp);
    // Preselecciona el paquete al llegar desde ?paquete=<id> (ej. "Ver detalles del paquete" del modal de promociones)
    const initialSelectedId = paquete ? Number(paquete) : undefined;

    return (
        <div className="min-h-screen">
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'ItemList',
                    itemListElement: packages.map((pkg, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        item: {
                            '@type': 'Service',
                            name: pkg.title,
                            description: pkg.short_description || undefined,
                            image: pkg.image_url ? getImageUrl(pkg.image_url) : undefined,
                            url: `${SITE_URL}/package`,
                        },
                    })),
                }}
            />

            <BannerComponent banner={banners[0] ?? null} fallbackSrc={ROUTES_IMAGES.paquetes.src_banner} />

            <PackagesComponent packages={packages} whatsappPhone={whatsappPhone} initialSelectedId={initialSelectedId} />

            <QuestionsComponent faqs={faqs} />
        </div>
    )
}
