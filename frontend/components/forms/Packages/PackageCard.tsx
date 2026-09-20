// components/packages/PackageCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from '@/src/types/package';
import { deletePackage } from '@/lib/api/packages';
import {
  Edit, Trash2, Calendar, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { confirmAction, showErrorAlert } from '@/lib/alerts';

interface Props {
  packageItem: Package;
  onDelete?: (id: number) => void;
}

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date: string) => {
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
};

export default function PackageCard({ packageItem, onDelete }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // <--- NUEVO

  // Obtener lista de imágenes (si hay)
  const imageList = packageItem.images_url || [];
  const hasMultipleImages = imageList.length > 1;

  // Auto-play del carrusel
  useEffect(() => {
    if (!hasMultipleImages || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [imageList.length, hasMultipleImages, isAutoPlaying]);

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goPrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleEdit = () => {
    router.push(`/packages/${packageItem.id}/edit`);
  };

  const handleDelete = async () => {
    if (!(await confirmAction({ text: `¿Eliminar el paquete "${packageItem.title}"?` }))) return;
    setIsDeleting(true);
    try {
      await deletePackage(packageItem.id);
      if (onDelete) onDelete(packageItem.id);
      router.refresh();
    } catch {
      showErrorAlert('Error al eliminar el paquete');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const today = getToday();
  const start = packageItem.date_available_start?.slice(0, 10);
  const end = packageItem.date_available_end?.slice(0, 10);
  const status = end && end < today
    ? 'expired'
    : start && start > today
      ? 'upcoming'
      : packageItem.is_active
        ? 'active'
        : 'inactive';

  // Construir URL base para imágenes
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // Obtener características (features)
  const features = packageItem.features || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Carrusel de imágenes */}
      <div className="relative w-full pt-[60%] bg-gray-100 overflow-hidden group">
        {imageList.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={`${baseUrl}${imageList[currentImageIndex]}`}
                  alt={packageItem.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>

            {hasMultipleImages && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imageList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToImage(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'bg-white w-4'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="text-sm">Sin imágenes</span>
          </div>
        )}

        {/* Badge de estado */}
        <div className="absolute top-3 right-3 flex gap-2">
          {status === 'active' ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Activo
            </span>
          ) : status === 'upcoming' ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Calendar className="w-3 h-3 mr-1" />
              Próximo
            </span>
          ) : status === 'expired' ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <XCircle className="w-3 h-3 mr-1" />
              Caducado
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              Inactivo
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col grow">
        <h3 className="font-noto-serif font-semibold text-xl text-gray-800 line-clamp-1">
          {packageItem.title}
        </h3>

        <p className="text-gray-600 text-sm mt-1 line-clamp-2 grow">
          {packageItem.short_description || 'Sin descripción'}
        </p>

        {/* Fechas (si existen) */}
        {(packageItem.date_available_start || packageItem.date_available_end) && (
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <Calendar className="w-4 h-4" />
            {packageItem.date_available_start && (
              <span>Desde: {formatDate(packageItem.date_available_start)}</span>
            )}
            {packageItem.date_available_end && (
              <span>Hasta: {formatDate(packageItem.date_available_end)}</span>
            )}
          </div>
        )}

        {/* Características - Vista previa */}
        {features.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {features.slice(0, 3).map((feature, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {feature.feature_key}: {feature.feature_value}
                </span>
              ))}
              {features.length > 3 && (
                <button
                  onClick={toggleExpand}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full hover:bg-blue-200 transition-colors"
                >
                  +{features.length - 3} más
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            {/* Características expandidas */}
            <AnimatePresence>
              {isExpanded && features.length > 3 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-2"
                >
                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    {features.slice(3).map((feature, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{feature.feature_key}:{feature.feature_value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-1" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </>
              )}
            </button>
          </div>

          <span className="text-xs text-gray-400">
            ID: {packageItem.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
}