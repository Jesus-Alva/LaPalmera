"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
  sizes?: string;
  priority?: boolean;
  fallbackSrc: string;
}

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

const PackageImageCarousel: React.FC<Props> = ({ images, alt, sizes, priority, fallbackSrc }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  // Reinicia el índice cuando cambia el paquete/lista de imágenes
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  // Auto-play del carrusel
  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hasMultipleImages, images.length]);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const src = images.length > 0 ? getImageUrl(images[currentIndex]) : fallbackSrc;

  return (
    <div className="absolute inset-0 group/carousel">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
        unoptimized={images.length > 0}
      />

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Imagen anterior"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white rounded-full p-1 transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="w-4 h-4 z-40" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Imagen siguiente"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white rounded-full p-1 transition-colors hover:bg-black/70"
          >
            <ChevronRight className="w-4 h-4 z-40" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex gap-1">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PackageImageCarousel;
