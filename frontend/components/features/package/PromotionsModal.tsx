"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, CalendarDays, Sparkles, ArrowRight } from "lucide-react";
import { Package } from "@/src/types/package";

interface Props {
  packages: Package[];
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_IMAGE = "/images/package/default_package.jpeg";
const AUTO_ADVANCE_MS = 5000;
// Alto del contenedor (% del ancho) mientras se mide la imagen o si falla la medición
const DEFAULT_ASPECT_RATIO = 0.52;
// Límites del alto ajustable: evita que una infografía muy ancha quede como una franja
// diminuta, o que una imagen muy vertical infle demasiado el modal
const MIN_ASPECT_RATIO = 0.35;
const MAX_ASPECT_RATIO = 0.85;

const getImageUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${path}`;

// Imagen protagonista del paquete (la destacada; si no hay, la primera de la galería)
const getPackageImage = (pkg: Package): string => {
  if (pkg.image_url) return getImageUrl(pkg.image_url);
  if (pkg.images_url && pkg.images_url.length > 0) return getImageUrl(pkg.images_url[0]);
  return DEFAULT_IMAGE;
};

// Los campos vienen como "YYYY-MM-DD"; se parsean manualmente para evitar el
// corrimiento de un día que produce `new Date(str)` al interpretarlo en UTC.
const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const PromotionsModal: React.FC<Props> = ({ packages, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // Alto (relación con el ancho) medido de la imagen real de cada paquete, para que
  // una infografía horizontal no se recorte al forzarla a una relación fija.
  const [aspectRatios, setAspectRatios] = useState<Record<number, number>>({});
  const hasMultiple = packages.length > 1;

  const handleImageLoad = (pkgId: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, naturalHeight / naturalWidth));
    setAspectRatios((prev) => (prev[pkgId] === ratio ? prev : { ...prev, [pkgId]: ratio }));
  };

  // Reinicia el carrusel cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !hasMultiple || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % packages.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isOpen, hasMultiple, isAutoPlaying, packages.length]);

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % packages.length);

  const currentPackage = packages[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {packages.length === 0 ? (
              <>
                <div className="flex justify-between items-center p-5 md:p-6 border-b-2 border-secondary/20">
                  <h2 className="flex items-center gap-3 text-xl md:text-2xl font-noto-serif font-bold text-secondary">
                    <span className="w-1.5 h-6 md:h-8 bg-secondary rounded-full inline-block" />
                    Promociones de temporada
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center text-gray-500 hover:scale-105"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-center text-gray-500 font-manrope py-12 px-5">
                  No hay promociones de temporada disponibles por el momento.
                </p>
              </>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {/* La imagen ocupa la mayor parte del modal; su alto se ajusta a la proporción real de
                    cada imagen (una infografía horizontal no se recorta como con una relación fija) */}
                <div
                  className="relative w-full overflow-hidden rounded-t-2xl bg-gray-900 transition-[padding-top] duration-300"
                  style={{ paddingTop: `${(aspectRatios[currentPackage.id] ?? DEFAULT_ASPECT_RATIO) * 100}%` }}
                >
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={currentPackage.id}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ opacity: { duration: 0.6, ease: "easeInOut" }, scale: { duration: AUTO_ADVANCE_MS / 1000, ease: "linear" } }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={getPackageImage(currentPackage)}
                        alt={currentPackage.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="object-contain"
                        priority
                        unoptimized
                        onLoad={handleImageLoad(currentPackage.id)}
                      />
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                  <span className="absolute top-4 left-4 z-20 inline-flex items-center gap-1 bg-secondary text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full shadow-md">
                    <Sparkles className="w-3 h-3" />
                    Promoción de temporada
                  </span>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute top-3 right-3 z-20 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {hasMultiple && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Promoción anterior"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        aria-label="Siguiente promoción"
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </>
                  )}

                  {/* Contenido mínimo superpuesto: título y fecha */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 pointer-events-none">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-noto-serif font-bold text-white drop-shadow-lg">
                      {currentPackage.title}
                    </h3>
                    {currentPackage.date_available_start && (
                      <p className="flex items-center gap-1.5 text-white/90 font-manrope text-xs md:text-sm mt-1 drop-shadow">
                        <CalendarDays className="w-4 h-4 shrink-0" />
                        {currentPackage.date_available_end
                          ? `${formatDate(currentPackage.date_available_start)} - ${formatDate(currentPackage.date_available_end)}`
                          : `Desde el ${formatDate(currentPackage.date_available_start)}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Indicadores del carrusel (solo si hay más de una promoción) */}
                {hasMultiple && (
                  <div className="flex justify-center gap-2 pt-4">
                    {packages.map((pkg, idx) => (
                      <button
                        key={pkg.id}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Ir a la promoción ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentIndex ? "w-8 bg-secondary" : "w-2 bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Redirige a la ficha completa del paquete en la página pública */}
                <div className="p-4 md:p-5">
                  <Link
                    href={`/package?paquete=${currentPackage.id}`}
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white font-noto-serif py-2.5 px-5 rounded-full transition-all shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Ver detalles del paquete
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionsModal;
