"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "../../../lib/hooks/useTranslation";
// Eliminamos useLang si no se usa realmente
// import { useLang } from "../../../lib/i18n/LanguageProvider";

interface ComponentProps {
  srcBanner: string;
}

const BannerComponent: React.FC<ComponentProps> = ({ srcBanner }) => {
  const { t } = useTranslation();
  // const { locale, setLocale } = useLang(); // No se usa

  return (
    <section
      id="inicio"
      className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src={srcBanner}
          alt="Banner background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay opcional para mejorar contraste del texto */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Contenido del banner */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-noto-serif font-normal mb-4 md:mb-6 drop-shadow-lg">
          {t("package.banner.title")}
        </h2>
        <p className="w-full sm:w-5/6 md:w-3/4 lg:w-2/3 mx-auto text-lg sm:text-2xl md:text-3xl lg:text-4xl font-noto-serif font-extralight drop-shadow-lg bg-black/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
          {t("package.banner.slogan")}
        </p>
      </div>
    </section>
  );
};

export default BannerComponent;