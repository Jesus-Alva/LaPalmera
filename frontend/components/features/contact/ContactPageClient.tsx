'use client';

import FaqJsonLd from '@/components/seo/FaqJsonLd';
import TitleContactComponent from './TitleContactComponent';
import InformationComponent from './InformationComponent';
import FormComponent from './FormComponent';
import { useTranslation } from '@/lib/hooks/useTranslation';
import type { contact } from '@/src/types/contact';
import type { Faq } from '@/src/types/faq';

interface ContactPageClientProps {
  faqs: Faq[];
}

export default function ContactPageClient({ faqs }: ContactPageClientProps) {
  const { t } = useTranslation();
  const dataBanner = t('contact', { returnObjects: true }) as contact;

  return (
    <div className="min-h-screen">
      <FaqJsonLd faqs={faqs} />
      <TitleContactComponent data={dataBanner} />
      <InformationComponent data={dataBanner.information} />
      <FormComponent data={dataBanner.reservation} />
    </div>
  );
}
