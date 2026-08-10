'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadImage, deleteImage, getOrCreateCatalog, getCatalogBySpace } from '@/lib/api/images';
import { Image } from '@/src/types/images';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  spaceId: number;
}

export default function ImageUpload({ spaceId }: ImageUploadProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [catalogId, setCatalogId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Cargar catálogo e imágenes al montar
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const catalog = await getCatalogBySpace(spaceId);
        if (catalog) {
          setCatalogId(catalog.id);
          setImages(catalog.images || []);
        }
      } catch (error) {
        console.error('Error cargando catálogo:', error);
      }
    };
    loadCatalog();
  }, [spaceId]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleUpload(files);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(files);
    }
  };

  const handleUpload = async (files: FileList) => {
    if (!catalogId) {
      // Crear catálogo automáticamente si no existe
      try {
        const catalog = await getOrCreateCatalog(spaceId);
        setCatalogId(catalog.id);
        setImages(catalog.images || []);
      } catch (error) {
        alert('Error al crear catálogo');
        return;
      }
    }

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const newImage = await uploadImage(catalogId!, file, file.name);
        setImages((prev) => [...prev, newImage]);
      } catch (error) {
        console.error('Error subiendo imagen:', error);
      }
    });
    await Promise.all(uploadPromises);
    setUploading(false);
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      await deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      alert('Error al eliminar imagen');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Imágenes del espacio</h3>

      {/* Área de drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
          <p className="text-sm text-gray-400">
            Formatos: JPG, PNG, WEBP, GIF (máx 5MB)
          </p>
          {uploading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              <span>Subiendo...</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative group rounded-lg overflow-hidden shadow-md bg-gray-100"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${image.image_path}`}
                  alt={image.alt_text || 'Imagen'}
                  className="w-full h-48 object-cover"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </motion.button>
                {image.alt_text && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                    {image.alt_text}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}