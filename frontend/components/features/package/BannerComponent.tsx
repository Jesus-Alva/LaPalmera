"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { Banner } from "../../../src/types/banners";

interface ComponentProps {
  banner: Banner | null;
  /** Imagen(es) locales de respaldo mientras no se registre un banner para esta página en el admin */
  fallbackSrc: string | readonly string[];
}

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

const BannerComponent: React.FC<ComponentProps> = ({ banner, fallbackSrc }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Imágenes del banner registrado en BD; si no hay ninguno (o sin imágenes), cae al respaldo local
  const dbImages = banner?.images_url && banner.images_url.length > 0
    ? banner.images_url.map(getImageUrl)
    : (banner?.image_url ? [getImageUrl(banner.image_url)] : []);
  const images = dbImages.length > 0 ? dbImages : Array.from(Array.isArray(fallbackSrc) ? fallbackSrc : [fallbackSrc]);
  const hasMultipleImages = images.length > 1;

  // Carrusel automático cuando se registró más de una imagen
  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [hasMultipleImages, images.length]);

  const title = banner?.title || t("package.banner.title");
  const slogan = banner?.description || t("package.banner.slogan");

  return (
    <section
      id="inicio"
      className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Imagen de fondo (carrusel si el banner registrado tiene más de una imagen) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={images[currentIndex]}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2, ease: "easeInOut" }, scale: { duration: 5, ease: "linear" } }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={banner?.title || "Banner background"}
              fill
              className="object-cover"
              priority
              unoptimized={dbImages.length > 0}
            />
          </motion.div>
        </AnimatePresence>
        {/* Overlay opcional para mejorar contraste del texto */}
        <div className="absolute inset-0 bg-black/30"></div>

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

      {/* Contenido del banner */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-noto-serif font-normal mb-4 md:mb-6 drop-shadow-lg">
          {title}
        </h1>
        <p className="w-full sm:w-5/6 md:w-3/4 lg:w-2/3 mx-auto text-lg sm:text-2xl md:text-3xl lg:text-4xl font-noto-serif font-extralight drop-shadow-lg bg-black/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
          {slogan}
        </p>
      </div>
    </section>
  );
};

export default BannerComponent;
