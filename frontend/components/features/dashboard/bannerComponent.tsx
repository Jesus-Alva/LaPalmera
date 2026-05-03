"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { useLang } from "../../../lib/i18n/LanguageProvider";

interface ComponentProps {
    srcBanner: string;
}

const BannerComponent: React.FC<ComponentProps> = ({ srcBanner }) => {
    const {t} = useTranslation();
    const { locale, setLocale } = useLang();

    return (
        <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
                {/* Imagen de fondo (puedes cambiar la URL por una imagen local o de tu preferencia) */}
                <div className="absolute inset-4 top-0 left-0 w-full h-full z-0">
                    <Image
                        src={srcBanner}
                        alt="Programming background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay oscuro para mejorar legibilidad */}
                    {/* <div className="absolute inset-0 bg-black/50 bg-opacity-60"></div> */}
                </div>

                {/* Contenido del dashboard */}
                <div className="relative z-10 text-center text-white px-4">
                    <h2 className="text-4xl md:text-7xl font-noto-serif font-normal mb-6 drop-shadow-lg">
                        {t('inicio.banner.title')}
                    </h2>
                    <p className="w-3/4 mx-auto text-2xl md:text-4xl font-noto-serif font-extralight mb-12 drop-shadow-lg">
                        {t('inicio.banner.slogan')}
                    </p>
                    <a href="#tecnologias" className="inline-block bg-primary uppercase text-black rounded font-noto-serif font-light px-6 py-3 hover:bg-secondary hover:text-primary transition duration-500">
                        {t('inicio.banner.button')}
                    </a>

                </div>
            </section>
    )
}

export default BannerComponent;