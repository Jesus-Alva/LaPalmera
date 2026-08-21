"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { FaRegCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import PackageImageCarousel from "./PackageImageCarousel";
import { Package } from "@/src/types/package";

interface ComponentProps {
  packages: Package[];
}

const DEFAULT_IMAGE = "/images/package/default_package.jpeg";

// Lista de imágenes de un paquete (usa images_url; si no viene, cae a la imagen destacada)
const getPackageImages = (pkg: Package): string[] =>
  pkg.images_url && pkg.images_url.length > 0
    ? pkg.images_url
    : (pkg.image_url ? [pkg.image_url] : []);

const PackagesComponent: React.FC<ComponentProps> = ({ packages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [itemsPerView, setItemsPerView] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para swipe táctil
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalPackages = packages.length;

  const updateItemsPerView = () => {
    if (typeof window === "undefined") return 3;
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 768px)").matches) return 2;
    return 1;
  };

  useEffect(() => {
    const updateLayout = () => {
      const columns = updateItemsPerView();
      setItemsPerView(columns);
      if (trackRef.current) {
        const containerWidth = trackRef.current.parentElement?.clientWidth || 0;
        const newItemWidth = containerWidth / columns;
        setItemWidth(newItemWidth);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);

    const resizeObserver = new ResizeObserver(updateLayout);
    if (trackRef.current?.parentElement) {
      resizeObserver.observe(trackRef.current.parentElement);
    }

    return () => {
      window.removeEventListener("resize", updateLayout);
      resizeObserver.disconnect();
    };
  }, []);

  const maxIndex = Math.max(0, totalPackages - itemsPerView);
  const safeIndex = Math.min(currentIndex, maxIndex);

  useEffect(() => {
    if (safeIndex !== currentIndex) {
      setCurrentIndex(safeIndex);
    }
  }, [itemsPerView, maxIndex, safeIndex, currentIndex]);

  const canPrev = safeIndex > 0;
  const canNext = safeIndex < maxIndex;

  const goPrev = () => {
    if (canPrev) setCurrentIndex(safeIndex - 1);
    resetAutoPlay();
  };
  const goNext = () => {
    if (canNext) setCurrentIndex(safeIndex + 1);
    resetAutoPlay();
  };

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (canNext) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        stopAutoPlay();
      }
    }, 3000);
  };
  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  const resetAutoPlay = () => {
    stopAutoPlay();
    startAutoPlay();
  };

  useEffect(() => {
    if (packages.length === 0) return;
    startAutoPlay();
    return () => stopAutoPlay();
  }, [canNext, safeIndex, packages.length]);

  // Handlers de swipe táctil (solo cuando itemsPerView === 1)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (itemsPerView !== 1) return;
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (itemsPerView !== 1 || touchStart === null) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (itemsPerView !== 1 || touchStart === null || touchEnd === null) {
      setIsDragging(false);
      setTouchStart(null);
      return;
    }
    const distance = touchEnd - touchStart;
    const minSwipeDistance = 50;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0 && canPrev) {
        goPrev(); // deslizar derecha -> anterior
      } else if (distance < 0 && canNext) {
        goNext(); // deslizar izquierda -> siguiente
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  };

  const translateX = -safeIndex * itemWidth;

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    resetAutoPlay();
  };
  const clearSelection = () => setSelectedIdx(null);
  const selectedPackage = selectedIdx !== null ? packages[selectedIdx] : null;

  const handleMouseEnter = () => stopAutoPlay();
  const handleMouseLeave = () => startAutoPlay();

  const WhatsAppMessage = useMemo(() => {
    if (!selectedPackage) return "";

    const lines = [
      `Hola, estoy interesado en el paquete "${selectedPackage.title}"`,
      "",
      "*Detalles del paquete:*",
      ...selectedPackage.features.map((f) => `${f.feature_key}: ${f.feature_value}`),
      "",
      "Quedo atento a su respuesta.",
    ];
    return lines.join("\n");
  }, [selectedPackage]);

  if (packages.length === 0) {
    return null;
  }

  return (
    <section id="description" className="container mx-auto px-4 py-12 md:py-16 my-12 md:my-18.75">
      <div
        ref={carouselRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className={`flex transition-transform duration-500 ease-in-out ${isDragging ? "duration-0" : ""}`}
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {packages.map((pkg, idx) => {
              const packageImages = getPackageImages(pkg);
              const isSelected = selectedIdx === idx;
              const previewFeatures = pkg.features.slice(0, 3);

              return (
                <div
                  key={pkg.id}
                  className="shrink-0 p-3 md:p-4 package-card cursor-pointer"
                  style={{ width: itemWidth ? `${itemWidth}px` : "auto" }}
                  onClick={() => handleSelect(idx)}
                >
                  <div
                    className={`
                      bg-white rounded-2xl shadow-lg transition-all duration-300 h-full flex flex-col
                      ${isSelected ? "bg-secondary scale-105" : "hover:scale-105 hover:shadow-xl"}
                    `}
                  >
                    <div className="relative w-full pt-[60%] overflow-hidden rounded-t-2xl">
                      <PackageImageCarousel
                        images={packageImages}
                        alt={pkg.title}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        fallbackSrc={DEFAULT_IMAGE}
                      />
                    </div>
                    <div
                      className={`p-5 md:p-8 lg:p-10 flex flex-col flex-grow ${isSelected ? "bg-secondary text-white rounded-b-2xl" : ""
                        }`}
                    >
                      <h3 className="font-noto-serif font-normal text-2xl md:text-3xl lg:text-4xl mb-2">
                        {pkg.title}
                      </h3>
                      <span className="font-noto-serif font-light text-sm md:text-base">
                        {pkg.short_description}
                      </span>
                      <ul className="mt-4 space-y-2 font-manrope text-xs md:text-sm grow">
                        {previewFeatures.map((feature) => (
                          <li key={feature.id} className="flex items-start gap-2">
                            <FaRegCheckCircle
                              className={`w-5 h-5 md:w-6 md:h-6 shrink-0 mt-0.5 ${isSelected ? "text-yellow-500" : "text-gray-700"
                                }`}
                            />
                            <span>{feature.feature_value}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`w-full mt-6 font-noto-serif uppercase py-2 md:py-3 px-4 border transition-colors duration-300 rounded-lg text-sm md:text-base ${isSelected
                          ? "bg-primary text-secondary border-primary hover:bg-opacity-90"
                          : "border-gray-800 text-gray-800 hover:bg-secondary hover:text-primary"
                          }`}
                      >
                        Más Detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {totalPackages > itemsPerView && (
          <>
            <button
              onClick={goPrev}
              disabled={!canPrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-14 md:h-14 rounded-full bg-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="text-gray-800 text-3xl md:text-4xl" />
            </button>
            <button
              onClick={goNext}
              disabled={!canNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-14 md:h-14 rounded-full bg-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight className="text-gray-800 text-3xl md:text-4xl" />
            </button>
          </>
        )}
      </div>

      {selectedPackage && (
        <div className="mt-12 md:mt-16 overflow-hidden transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Encabezado */}
            <div className="flex justify-between items-center p-5 md:p-6 border-b-2 border-secondary/20 bg-linear-to-r from-secondary/5 to-transparent">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl lg:text-3xl font-noto-serif font-bold text-secondary">
                <span className="w-1.5 h-6 md:h-8 bg-secondary rounded-full inline-block" />
                Detalles del Servicio
              </h2>
              <button
                onClick={clearSelection}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center text-gray-500 hover:scale-105"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Imagen de portada con título y descripción superpuestos */}
            <div className="relative w-full pt-[35%] md:pt-[30%] overflow-hidden">
              <PackageImageCarousel
                images={getPackageImages(selectedPackage)}
                alt={selectedPackage.title}
                sizes="100vw"
                fallbackSrc={DEFAULT_IMAGE}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 pointer-events-none">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-noto-serif font-bold text-white drop-shadow-lg mb-1 md:mb-2">
                  {selectedPackage.title}
                </h3>
                <p className="text-white/90 font-manrope text-sm md:text-base max-w-2xl drop-shadow">
                  {selectedPackage.short_description}
                </p>
              </div>
            </div>

            {/* Grid de características */}
            <div className="p-5 md:p-8">
              <h4 className="font-noto-serif font-semibold text-secondary text-base md:text-lg uppercase tracking-widest mb-4 md:mb-5">
                Lo que incluye
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {selectedPackage.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-3 bg-gray-50 hover:bg-secondary/5 border border-gray-100 hover:border-secondary/30 rounded-xl p-4 transition-colors duration-300"
                  >
                    <FaRegCheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-noto-serif font-semibold text-gray-800 text-sm md:text-base">
                        {feature.feature_key}
                      </p>
                      <p className="font-manrope text-gray-600 text-xs md:text-sm mt-0.5">
                        {feature.feature_value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 md:px-8 pb-6 flex justify-end">
              <WhatsAppButton message={WhatsAppMessage} className="bg-secondary hover:bg-secondary/90 text-white font-noto-serif py-2 px-5 md:py-2.5 md:px-7 rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm md:text-base">
                <span>Solicitar más información sobre este paquete</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </WhatsAppButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PackagesComponent;
