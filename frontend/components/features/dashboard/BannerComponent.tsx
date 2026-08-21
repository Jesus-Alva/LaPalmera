"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { Banner } from "../../../src/types/banners";
import { ROUTES_IMAGES } from "../../../app/constants/routes";

interface ComponentProps {
    banner: Banner | null;
}

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${path}`;

const BannerComponent: React.FC<ComponentProps> = ({ banner }) => {
    const {t} = useTranslation();

    const imageSrc = banner?.image_url ? getImageUrl(banner.image_url) : ROUTES_IMAGES.dashboard;
    const title = banner?.title || t('inicio.banner.title');
    const slogan = banner?.description || t('inicio.banner.slogan');

    return (
        <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
                {/* Imagen de fondo (destacada del banner activo en BD, o imagen por defecto) */}
                <div className="absolute inset-4 top-0 left-0 w-full h-full z-0">
                    <Image
                        src={imageSrc}
                        alt={banner?.title || "Programming background"}
                        fill
                        className="object-cover"
                        priority
                        unoptimized={!!banner?.image_url}
                    />
                    {/* Overlay oscuro para mejorar legibilidad */}
                    {/* <div className="absolute inset-0 bg-black/50 bg-opacity-60"></div> */}
                </div>


                {/* Contenido del dashboard */}
                <div className="relative z-10 text-center text-white px-4">
                    <h2 className="text-4xl md:text-7xl font-noto-serif font-normal mb-6 drop-shadow-lg">
                        {title}
                    </h2>
                    <p className="w-3/4 mx-auto text-2xl md:text-4xl font-noto-serif font-extralight mb-12 drop-shadow-lg">
                        {slogan}
                    </p>
                    <a href="/contact#formulario" className="inline-block bg-primary uppercase text-black rounded font-noto-serif font-light px-6 py-3 hover:bg-secondary hover:text-primary transition duration-500">
                        {t('inicio.banner.button')}
                    </a>

                </div>
            </section>
    )
}

export default BannerComponent;
