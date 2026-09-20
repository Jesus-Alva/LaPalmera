import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getPublicFaqs, getPublicSetting } from "@/lib/api/public";
import ContactPageClient from "@/components/features/contact/ContactPageClient";
import type { ContactInfoItem, ScheduleItem } from "@/src/types/siteSettings";

export async function generateMetadata(): Promise<Metadata> {
    return buildPageMetadata({
        title: 'Contacto | La Palmera',
        description: 'Comunicate con nosotros mediante los datos que te proporcionamos.',
        path: '/contact',
    });
}

export default async function Page() {
    const [faqs, contactInfo, schedule] = await Promise.all([
        getPublicFaqs().catch(() => []),
        getPublicSetting('contact_info').catch((): ContactInfoItem[] => []),
        getPublicSetting('schedule').catch((): ScheduleItem[] => []),
    ]);

    return <ContactPageClient faqs={faqs} contactInfo={contactInfo} schedule={schedule} />;
}