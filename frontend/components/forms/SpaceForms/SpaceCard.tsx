// components/forms/SpaceForms/SpaceCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Space } from '@/src/types/space';
import { deleteSpace } from '@/lib/api/spaces';
import { Edit, Trash2, CheckCircle, XCircle, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  space: Space;
  onDelete?: (id: number) => void;
}

export default function SpaceCard({ space, onDelete }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

  // Lista de imágenes del espacio (si hay más de una, se muestran en carrusel)
  const imageList = space.images_url && space.images_url.length > 0
    ? space.images_url
    : space.image_url
      ? [space.image_url]
      : [];
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
    router.push(`/spaces/${space.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el espacio "${space.title}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteSpace(space.id);
      if (onDelete) onDelete(space.id);
      router.refresh();
    } catch (error) {
      alert('Error al eliminar el espacio');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
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
                  alt={space.title}
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
                      className={`h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80 w-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <ImageOff className="w-8 h-8" />
          </div>
        )}

        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          {space.is_active ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Activo
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
          {space.title}
        </h3>

        <p className="text-gray-600 text-sm mt-1 line-clamp-2 grow">
          {space.description || 'Sin descripción'}
        </p>

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
            ID: {space.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
