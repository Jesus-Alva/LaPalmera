"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

// Variantes de animación
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

interface GalleryCategory {
  category: string;
  images: string[];
}

const GalleryImageComponent: React.FC = () => {
  const { t } = useTranslation();
  const dataGallery = t("gallery.images", { returnObjects: true }) as GalleryCategory[];
  const categories = Array.isArray(dataGallery) ? dataGallery : [];

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const firstWithImages = categories.find(cat => cat.images.length > 0);
    return firstWithImages ? firstWithImages.category : "";
  });

  const activeCategory = categories.find(cat => cat.category === selectedCategory);
  const imagesToShow = activeCategory?.images || [];

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1: siguiente, -1: anterior

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    setDirection(0); // sin animación al abrir
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev === 0 ? imagesToShow.length - 1 : prev - 1));
  }, [imagesToShow.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentImageIndex((prev) => (prev === imagesToShow.length - 1 ? 0 : prev + 1));
  }, [imagesToShow.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [lightboxOpen]);

  return (
    <section className="py-8">
      {/* Filtro de categorías */}
      <div className="flex justify-start flex-wrap container mx-auto px-4 gap-2 mb-8">
        {categories.map((item, index) => (
          <div key={index} className="w-auto p-1">
            <span
              onClick={() => item.images.length > 0 && setSelectedCategory(item.category)}
              className={`
                font-noto-serif font-medium tracking-wide border px-4 py-2 rounded-full 
                transition-all duration-300 cursor-pointer inline-block
                ${selectedCategory === item.category
                  ? "bg-secondary text-white border-secondary shadow-md"
                  : "border-secondary text-secondary hover:bg-secondary hover:text-white"
                }
                ${item.images.length === 0 ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              {item.category}
              {item.images.length === 0 && " (próximamente)"}
            </span>
          </div>
        ))}
      </div>

      {/* Cuadrícula de imágenes */}
      <div className="container mx-auto px-4">
        {imagesToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagesToShow.map((imgSrc, imgIdx) => (
              <div
                key={imgIdx}
                onClick={() => openLightbox(imgIdx)}
                className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all group cursor-pointer"
              >
                <Image
                  src={imgSrc}
                  alt={`${selectedCategory} - ${imgIdx + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">
              No hay imágenes disponibles para esta categoría.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Próximamente añadiremos más contenido.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white text-4xl hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <IoClose />
          </button>

          {/* Contenedor de imagen y navegación */}
          <div
            className="relative w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen actual con animación */}
            <div className="relative aspect-video h-[150vh] w-full overflow-hidden">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentImageIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={imagesToShow[currentImageIndex]}
                    alt={`Imagen ${currentImageIndex + 1} de ${selectedCategory}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 90vw, 80vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Botón anterior */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white text-3xl p-2 rounded-full transition-colors"
              aria-label="Anterior"
            >
              <IoChevronBack />
            </button>

            {/* Botón siguiente */}
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white text-3xl p-2 rounded-full transition-colors"
              aria-label="Siguiente"
            >
              <IoChevronForward />
            </button>

            {/* Contador de imágenes */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              {currentImageIndex + 1} / {imagesToShow.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GalleryImageComponent;