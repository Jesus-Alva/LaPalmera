// components/gallery/CategoryDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryCategory, GalleryImage } from '@/src/types/gallery';
import { uploadGalleryImage, deleteGalleryImage, updateGalleryImage } from '@/lib/api/gallery';
import { Upload, X, Edit2, Check, Trash2 } from 'lucide-react';

interface Props {
  category: GalleryCategory;
}

export default function CategoryDetail({ category }: Props) {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>(category.images || []);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingAlt, setEditingAlt] = useState<number | null>(null);
  const [altText, setAltText] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const newImage = await uploadGalleryImage(category.id, file, file.name);
        setImages(prev => [...prev, newImage]);
      }
      router.refresh();
    } catch (error) {
      alert('Error al subir imágenes');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      await deleteGalleryImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      alert('Error al eliminar imagen');
    }
  };

  const handleEditAlt = (image: GalleryImage) => {
    setEditingAlt(image.id);
    setAltText(image.alt_text || '');
  };

  const handleSaveAlt = async (imageId: number) => {
    try {
      await updateGalleryImage(imageId, { alt_text: altText || null });
      setImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, alt_text: altText || null } : img
      ));
      setEditingAlt(null);
    } catch (error) {
      alert('Error al actualizar texto alternativo');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{category.name}</h1>
          <p className="text-sm text-gray-500">Slug: {category.slug}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/gallery/categories')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Subir imágenes
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
          Subiendo imágenes...
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
          <p className="text-gray-500">No hay imágenes en esta categoría.</p>
          <p className="text-sm text-gray-400 mt-1">Usa el botón "Subir imágenes" para agregar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="relative aspect-square">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${image.image_path}`}
                    alt={image.alt_text || 'Imagen de galería'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="p-3">
                  {editingAlt === image.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Texto alternativo"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveAlt(image.id)}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingAlt(null)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 truncate flex-1">
                        {image.alt_text || 'Sin texto alternativo'}
                      </p>
                      <button
                        onClick={() => handleEditAlt(image)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}