'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryCategory } from '@/src/types/gallery';
import { uploadGalleryImage, deleteGalleryImage } from '@/lib/api/gallery';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';

interface Props {
  category: GalleryCategory;
}

export default function GalleryImageManager({ category }: Props) {
  const router = useRouter();
  const [images, setImages] = useState(category.images || []);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelected = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const newImage = await uploadGalleryImage(category.id, file);
        setImages((prev) => [...prev, newImage]);
      }
      setSelectedFiles([]);
      setPreviews([]);
      router.refresh();
    } catch (error) {
      alert('Error al subir imágenes');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      await deleteGalleryImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      alert('Error al eliminar imagen');
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Galería: {category.name}</h1>
        <a href="/gallery" className="text-blue-600 hover:underline">
          ← Volver a categorías
        </a>
      </div>

      {/* Área de subida */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded flex items-center gap-2">
            <Upload size={20} />
            Seleccionar imágenes
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
          </label>
          <span className="text-sm text-gray-500">{selectedFiles.length} archivos seleccionados</span>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Subiendo...' : 'Subir imágenes'}
            </button>
          )}
        </div>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {previews.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeSelected(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid de imágenes existentes */}
      {images.length === 0 ? (
        <p className="text-gray-500">No hay imágenes en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
            >
              <Image
                src={`${baseUrl}${img.image_path}`}
                alt={img.alt_text || ''}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={16} />
              </button>
              {img.alt_text && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                  {img.alt_text}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}