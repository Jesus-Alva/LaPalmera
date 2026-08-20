'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Banner, BannerCreate } from '@/src/types/banners';
import { createBanner, updateBanner } from '@/lib/api/banners';
import { getOrCreateCatalogForBanner, uploadImage, deleteImage } from '@/lib/api/images';
import { Image as ImageType } from '@/src/types/images';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface Props {
  initialData?: Banner;
}

export default function BannerForm({ initialData }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<ImageType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Cargar imágenes existentes si editamos
  useEffect(() => {
    if (!initialData?.id) return;

    let isMounted = true;

    const loadImages = async () => {
      try {
        const catalog = await getOrCreateCatalogForBanner(initialData.id);
        if (!isMounted) return;
        if (catalog?.images) {
          setImages(catalog.images);
        }
      } catch (error) {
        console.error('Error cargando imágenes:', error);
      }
    };

    void loadImages();

    return () => {
      isMounted = false;
    };
  }, [initialData?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      await deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      alert('Error al eliminar imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let banner;
      const data: BannerCreate = {
        title,
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
      };

      if (initialData) {
        banner = await updateBanner(initialData.id, data);
      } else {
        banner = await createBanner(data);
      }

      // Subir imágenes si hay seleccionadas
      if (selectedFiles.length > 0) {
        const catalog = await getOrCreateCatalogForBanner(banner.id);
        for (const file of selectedFiles) {
          await uploadImage(catalog.id, file);
        }
      }

      router.push('/banners');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Editar banner' : 'Nuevo banner'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos básicos */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título *</label>
          <input id="title" type="text" required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">Subtítulo</label>
          <input id="subtitle" type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Área de subida de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del banner</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Upload className="mr-2 h-4 w-4" />
              Seleccionar imágenes
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
            <span className="text-sm text-gray-500">{selectedFiles.length} archivos seleccionados</span>
          </div>

          {/* Previsualización de imágenes seleccionadas (para subir) */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {previews.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeSelectedFile(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Imágenes existentes (cuando se edita) */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${img.image_path}`}
                    alt={img.alt_text || 'Banner image'}
                    className="w-full h-full object-cover"
                  />
                  <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => router.push('/banners')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear banner')}
          </button>
        </div>
      </form>
    </div>
  );
}