"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarDays } from "lucide-react";
import PackageImageCarousel from "./PackageImageCarousel";
import { Package } from "@/src/types/package";

interface Props {
  packages: Package[];
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_IMAGE = "/images/package/default_package.jpeg";

// Lista de imágenes de un paquete (usa images_url; si no viene, cae a la imagen destacada)
const getPackageImages = (pkg: Package): string[] =>
  pkg.images_url && pkg.images_url.length > 0
    ? pkg.images_url
    : pkg.image_url
      ? [pkg.image_url]
      : [];

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
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 md:p-6 border-b-2 border-secondary/20 bg-linear-to-r from-secondary/5 to-transparent sticky top-0 bg-white z-10">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl lg:text-3xl font-noto-serif font-bold text-secondary">
                <span className="w-1.5 h-6 md:h-8 bg-secondary rounded-full inline-block" />
                Promociones
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

            <div className="p-5 md:p-8">
              {packages.length === 0 ? (
                <p className="text-center text-gray-500 font-manrope py-8">
                  No hay promociones con fecha disponible por el momento.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-secondary/30 transition-colors"
                    >
                      <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <PackageImageCarousel
                          images={getPackageImages(pkg)}
                          alt={pkg.title}
                          sizes="96px"
                          fallbackSrc={DEFAULT_IMAGE}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-noto-serif font-semibold text-gray-800 text-base md:text-lg truncate">
                          {pkg.title}
                        </h3>
                        {pkg.short_description && (
                          <p className="font-manrope text-gray-600 text-xs md:text-sm mt-1 line-clamp-2">
                            {pkg.short_description}
                          </p>
                        )}
                        {pkg.date_available_start && (
                          <p className="flex items-center gap-1.5 font-manrope text-secondary text-xs md:text-sm mt-2 font-medium">
                            <CalendarDays className="w-4 h-4 shrink-0" />
                            {pkg.date_available_end
                              ? `${formatDate(pkg.date_available_start)} - ${formatDate(pkg.date_available_end)}`
                              : `Desde el ${formatDate(pkg.date_available_start)}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionsModal;
