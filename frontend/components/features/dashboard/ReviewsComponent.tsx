// src/components/Reviews/ReviewsComponent.tsx
'use client';

import Script from "next/script";
import { useTranslation } from "../../../lib/hooks/useTranslation";

const ELFSIGHT_WIDGET_CLASS = "elfsight-app-cd0c69bf-e2e3-4faa-9edd-56099d783a00";

const ReviewsComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 py-12 my-12 md:my-18.75">
      <div className="container mx-auto">
        <p className="font-manrope font-bold uppercase tracking-widest text-center text-yellow-800 mb-4">
          {t('inicio.reviews.desc')}
        </p>
        <h2 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-normal text-center text-gray-800 mb-8 md:mb-12">
          {t('inicio.reviews.title')}
        </h2>

        <div className={ELFSIGHT_WIDGET_CLASS} data-elfsight-app-lazy></div>
      </div>

      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" async />
    </section>
  );
};

export default ReviewsComponent;
