'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Space, SpaceCreate } from '@/lib/types';
import { createSpace, updateSpace } from '@/lib/api/spaces';
import { getOrCreateCatalog, uploadImage } from '@/lib/api/images';

interface Props {
  initialData?: Space;
}

export default function SpaceForm({ initialData }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Manejar selección de imágenes
  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Eliminar imagen seleccionada
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      return newPreviews;
    });
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageSelect(e.dataTransfer.files);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Crear el espacio
      const spaceData: SpaceCreate = {
        title,
        description: description || undefined,
        is_active: isActive,
      };

      let space;
      if (initialData) {
        space = await updateSpace(initialData.id, spaceData);
      } else {
        space = await createSpace(spaceData);
      }

      // 2. Si hay imágenes, subirlas
      if (images.length > 0) {
        // Crear/obtener catálogo para el espacio
        const catalog = await getOrCreateCatalog(space.id);
        
        // Subir cada imagen
        let uploaded = 0;
        for (const file of images) {
          await uploadImage(catalog.id, file, file.name);
          uploaded++;
          setUploadProgress(Math.round((uploaded / images.length) * 100));
        }
      }

      // 3. Redirigir
      router.push('/spaces');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el espacio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Editar espacio' : 'Nuevo espacio'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos del espacio */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título *
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Activo
          </label>
        </div>

        {/* Área de subida de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes (opcional)
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
              onChange={(e) => handleImageSelect(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="text-gray-600 text-sm">
                Arrastra imágenes o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WEBP, GIF (máx 5MB)
              </p>
            </div>
          </div>

          {/* Previsualización de imágenes seleccionadas */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              <AnimatePresence>
                {imagePreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={preview}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Barra de progreso (solo cuando se suben en el submit) */}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Subiendo imágenes... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/spaces')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Guardando...</span>
              </span>
            ) : (
              initialData ? 'Actualizar' : 'Crear espacio'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}