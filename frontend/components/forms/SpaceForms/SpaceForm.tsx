// components/forms/SpaceForms/SpaceForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Trash2 } from 'lucide-react';
import { Space, SpaceCreate } from '@/src/types/space';
import { createSpace, updateSpace } from '@/lib/api/spaces';
import { getCatalogBySpace, getOrCreateCatalog, uploadImage, deleteImage } from '@/lib/api/images';
import { confirmAction } from '@/lib/alerts';

interface Props {
  initialData?: Space;
}

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function SpaceForm({ initialData }: Props) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');

  // Imágenes ya guardadas en el espacio (solo aplica al editar)
  const [existingImages, setExistingImages] = useState<{ id: number; url: string; alt: string }[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Imágenes nuevas seleccionadas desde el input, pendientes de subir
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Cargar imágenes existentes al editar
  useEffect(() => {
    if (!isEditing || !initialData?.id) return;
    const fetchImages = async () => {
      setLoadingImages(true);
      try {
        const catalog = await getCatalogBySpace(initialData.id);
        if (catalog && catalog.images) {
          setExistingImages(
            catalog.images.map((img) => ({
              id: img.id,
              url: `${baseUrl}${img.image_path}`,
              alt: img.alt_text || 'Imagen del espacio',
            }))
          );
        }
      } catch (err) {
        console.error('Error cargando imágenes:', err);
      } finally {
        setLoadingImages(false);
      }
    };
    fetchImages();
  }, [isEditing, initialData?.id]);

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setNewImages((prev) => [...prev, ...newFiles]);
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = async (imageId: number) => {
    if (!(await confirmAction({ text: '¿Eliminar esta imagen permanentemente?' }))) return;
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Crear/actualizar el espacio (los campos básicos, sin tocar imágenes)
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

      // 2. Eliminar imágenes marcadas (solo en edición). Si no se marcó ninguna, no se toca nada.
      if (isEditing && imagesToDelete.length > 0) {
        for (const imageId of imagesToDelete) {
          await deleteImage(imageId);
        }
      }

      // 3. Subir imágenes nuevas, si las hay
      if (newImages.length > 0) {
        setUploadingImages(true);
        const catalog = await getOrCreateCatalog(space.id);
        for (const file of newImages) {
          await uploadImage(catalog.id, file, file.name);
        }
        setUploadingImages(false);
      }

      // 4. Redirigir
      router.push('/spaces');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el espacio');
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

        {/* Gestión de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes del espacio
          </label>

          {/* Imágenes existentes (solo en edición) */}
          {isEditing && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Imágenes actuales</h4>
              {loadingImages ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
                  Cargando imágenes...
                </div>
              ) : existingImages.length === 0 ? (
                <p className="text-sm text-gray-400">No hay imágenes registradas</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(img.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subida de nuevas imágenes */}
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {isEditing ? 'Agregar nuevas imágenes' : 'Seleccionar imágenes'}
          </h4>
          <div className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="text-gray-600 text-sm">Arrastra imágenes o haz clic para seleccionar</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP, GIF (máx 5MB)</p>
            </div>
          </div>

          {/* Previsualización de imágenes nuevas */}
          {newImagePreviews.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              <AnimatePresence>
                {newImagePreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    <img src={preview} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {uploadingImages && (
            <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
              Subiendo imágenes...
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
