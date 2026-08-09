'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Upload, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { uploadSpaceImage, deleteSpaceImage, getSpaceImages } from '@/lib/api/spaces';

interface ImageType {
  id: number;
  image_path: string;
  alt_text: string;
}

interface Props {
  spaceId: number;
  images?: ImageType[] | null; // Ahora es opcional
  onImagesChange?: () => void;
}

export default function SpaceImageGallery({ spaceId, images: initialImages, onImagesChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [localImages, setLocalImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar imágenes si no se pasan como prop
  useEffect(() => {
    if (initialImages !== undefined && initialImages !== null) {
      // Si se pasan imágenes, usarlas directamente
      setLocalImages(initialImages);
      setLoading(false);
    } else {
      // Si no se pasan, cargarlas desde el servidor
      const loadImages = async () => {
        try {
          const data = await getSpaceImages(spaceId);
          setLocalImages(data);
        } catch (error) {
          console.error('Error al cargar imágenes:', error);
          setLocalImages([]);
        } finally {
          setLoading(false);
        }
      };
      loadImages();
    }
  }, [spaceId, initialImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const newImage = await uploadSpaceImage(spaceId, formData);
      setLocalImages((prev) => [...prev, newImage]);
      if (onImagesChange) onImagesChange();
    } catch (error) {
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    setDeletingId(imageId);
    try {
      await deleteSpaceImage(spaceId, imageId);
      setLocalImages((prev) => prev.filter((img) => img.id !== imageId));
      if (onImagesChange) onImagesChange();
    } catch (error) {
      alert('Error al eliminar la imagen');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Galería de imágenes</h3>
          <button
            type="button"
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            <Loader2 className="animate-spin" size={16} />
            Cargando...
          </button>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <Loader2 className="animate-spin mx-auto mb-2" size={32} />
          <p>Cargando imágenes...</p>
        </div>
      </div>
    );
  }

  if (localImages.length === 0 && !uploading) {
    return (
      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Galería de imágenes</h3>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} />
            Subir imagen
          </button>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <p>No hay imágenes. Haz clic en "Subir imagen" para agregar una.</p>
          <p className="text-xs mt-1">Formatos permitidos: JPG, PNG, WebP (máx. 5MB)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Galería de imágenes</h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          {uploading ? 'Subiendo...' : 'Subir imagen'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {localImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              <Image
                src={image.image_path}
                alt={image.alt_text || 'Imagen del espacio'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deletingId === image.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <X size={16} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}