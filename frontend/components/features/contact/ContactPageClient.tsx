'use client';

import FaqJsonLd from '@/components/seo/FaqJsonLd';
import TitleContactComponent from './TitleContactComponent';
import InformationComponent from './InformationComponent';
import FormComponent from './FormComponent';
import { useTranslation } from '@/lib/hooks/useTranslation';
import type { contact } from '@/src/types/contact';
import type { Faq } from '@/src/types/faq';
import type { ContactInfoItem, ScheduleItem } from '@/src/types/siteSettings';

interface ContactPageClientProps {
  faqs: Faq[];
  contactInfo: ContactInfoItem[];
  schedule: ScheduleItem[];
}

export default function ContactPageClient({ faqs, contactInfo, schedule }: ContactPageClientProps) {
  const { t } = useTranslation();
  const dataBanner = t('contact', { returnObjects: true }) as contact;
  const information = {
    ...dataBanner.information,
    data: contactInfo.length > 0 ? contactInfo : dataBanner.information.data,
    schedule: {
      ...dataBanner.information.schedule,
      data: schedule.length > 0 ? schedule : dataBanner.information.schedule.data,
    },
  };

  return (
    <div className="min-h-screen">
      <FaqJsonLd faqs={faqs} />
      <TitleContactComponent data={dataBanner} />
      <InformationComponent data={information} />
      <FormComponent data={dataBanner.reservation} />
    </div>
  );
}
