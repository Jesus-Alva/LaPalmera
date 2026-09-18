"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { Banner } from "../../../src/types/banners";
import { ROUTES_IMAGES } from "../../../app/constants/routes";

interface ComponentProps {
    banner: Banner | null;
}

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

const BannerComponent: React.FC<ComponentProps> = ({ banner }) => {
    const {t} = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Lista de imágenes del banner (todas las cargadas); si no hay, cae a la imagen destacada o a la imagen por defecto
    const images = banner?.images_url && banner.images_url.length > 0
        ? banner.images_url
        : (banner?.image_url ? [banner.image_url] : []);
    const hasMultipleImages = images.length > 1;

    // Carrusel automático cuando hay más de una imagen
    useEffect(() => {
        if (!hasMultipleImages) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [hasMultipleImages, images.length]);

    const imageSrc = images.length > 0 ? getImageUrl(images[currentIndex]) : ROUTES_IMAGES.dashboard;
    const title = banner?.title || t('inicio.banner.title');
    const slogan = banner?.description || t('inicio.banner.slogan');

    return (
        <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
                {/* Imagen de fondo (carrusel si el banner activo tiene varias imágenes en BD) */}
                <div className="absolute inset-4 top-0 left-0 w-full h-full z-0">
                    <AnimatePresence mode="sync">
                        <motion.div
                            key={imageSrc}
                            initial={{ opacity: 0, scale: 1.06 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ opacity: { duration: 1.2, ease: "easeInOut" }, scale: { duration: 5, ease: "linear" } }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={imageSrc}
                                alt={banner?.title || "Programming background"}
                                fill
                                className="object-cover"
                                priority
                                unoptimized={images.length > 0}
                            />
                        </motion.div>
                    </AnimatePresence>
                    {/* Overlay oscuro para mejorar legibilidad */}
                    {/* <div className="absolute inset-0 bg-black/50 bg-opacity-60"></div> */}

                    {/* Indicadores del carrusel (solo si hay más de una imagen) */}
                    {hasMultipleImages && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    aria-label={`Ir a la imagen ${idx + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        idx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>


                {/* Contenido del dashboard */}
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-4xl md:text-7xl font-noto-serif font-normal mb-6 drop-shadow-lg">
                        {title}
                    </h1>
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
