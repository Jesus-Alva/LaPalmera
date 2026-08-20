// components/forms/Banners/BannerCard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Banner } from '@/src/types/banners';
import { deleteBanner } from '@/lib/api/banners';
import { Edit, Trash2, ImageOff } from 'lucide-react';

interface Props {
  banner: Banner;
  onDelete?: (id: number) => void;
}

export default function BannerCard({ banner, onDelete }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

  const handleEdit = () => {
    router.push(`/banners/${banner.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el banner "${banner.title}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteBanner(banner.id);
      if (onDelete) onDelete(banner.id);
      router.refresh();
    } catch (error) {
      alert('Error al eliminar el banner');
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
      {/* Imagen */}
      <div className="relative w-full pt-[45%] bg-gray-100 overflow-hidden">
        {banner.image_url ? (
          <Image
            src={`${baseUrl}${banner.image_url}`}
            alt={banner.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <ImageOff className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col grow">
        <h3 className="font-noto-serif font-semibold text-xl text-gray-800 line-clamp-1">
          {banner.title}
        </h3>

        {banner.subtitle && (
          <p className="text-gray-700 text-sm font-medium mt-1 line-clamp-1">
            {banner.subtitle}
          </p>
        )}

        <p className="text-gray-500 text-sm mt-1 line-clamp-2 grow">
          {banner.description || 'Sin descripción'}
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
            ID: {banner.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
