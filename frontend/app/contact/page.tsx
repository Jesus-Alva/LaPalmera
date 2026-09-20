import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getPublicFaqs } from "@/lib/api/public";
import ContactPageClient from "@/components/features/contact/ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
    return buildPageMetadata({
        title: 'Contacto | La Palmera',
        description: 'Comunicate con nosotros mediante los datos que te proporcionamos.',
        path: '/contact',
    });
}

export default async function Page() {
    const faqs = await getPublicFaqs().catch(() => []);

    return <ContactPageClient faqs={faqs} />;
}