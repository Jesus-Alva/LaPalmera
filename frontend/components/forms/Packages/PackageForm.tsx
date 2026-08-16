'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, PackageCreate } from '@/src/types/package';
import { Celebration } from '@/src/types/celebration';
import { createPackage, updatePackage } from '@/lib/api/packages';
import { getOrCreateCatalogForPackage, uploadImage } from '@/lib/api/images';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface Props {
  initialData?: Package;
  celebrations: Celebration[]; // <-- ahora viene del servidor
}

export default function PackageForm({ initialData, celebrations }: Props) {
  const router = useRouter();

  // Estados del formulario
  const [title, setTitle] = useState(initialData?.title || '');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [celebrationId, setCelebrationId] = useState<number>(initialData?.celebration_id || 0);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  // ⚠️ Corregido: los nombres de los campos son date_available_start/end (con 'date')
  const [dateAvailableStart, setDateAvailableStart] = useState(
    initialData?.data_available_start ? new Date(initialData.data_available_start).toISOString().split('T')[0] : ''
  );
  const [dateAvailableEnd, setDateAvailableEnd] = useState(
    initialData?.data_available_end ? new Date(initialData.data_available_end).toISOString().split('T')[0] : ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para imágenes
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Manejar imágenes
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!celebrationId) {
        throw new Error('Selecciona una celebración');
      }

      // 1. Crear/actualizar el paquete
      const data: PackageCreate = {
        title,
        short_description: shortDescription || undefined,
        celebration_id: celebrationId,
        sort_order: sortOrder,
        is_active: isActive,
        data_available_start: dateAvailableStart || null,
        data_available_end: dateAvailableEnd || null,
      };

      let packageResult;
      if (initialData) {
        packageResult = await updatePackage(initialData.id, data);
      } else {
        packageResult = await createPackage(data);
      }

      // 2. Subir imágenes (si hay)
      if (images.length > 0) {
        setUploadingImages(true);
        const catalog = await getOrCreateCatalogForPackage(packageResult.id);
        for (const file of images) {
          await uploadImage(catalog.id, file);
        }
        setUploadingImages(false);
      }

      router.push('/packages');
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
        {initialData ? 'Editar paquete' : 'Nuevo paquete'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título *</label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Descripción corta */}
        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Descripción corta</label>
          <textarea
            id="shortDescription"
            rows={3}
            value={shortDescription}
            onChange={e => setShortDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Selección de celebración */}
        <div>
          <label htmlFor="celebration" className="block text-sm font-medium text-gray-700">Celebración *</label>
          <select
            id="celebration"
            required
            value={celebrationId}
            onChange={e => setCelebrationId(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0">Selecciona una celebración...</option>
            {celebrations.map(celebration => (
              <option key={celebration.id} value={celebration.id}>
                {celebration.title}
              </option>
            ))}
          </select>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha de inicio (opcional)</label>
            <input
              id="startDate"
              type="date"
              value={dateAvailableStart}
              onChange={e => setDateAvailableStart(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Dejar vacío para paquetes permanentes</p>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha de fin (opcional)</label>
            <input
              id="endDate"
              type="date"
              value={dateAvailableEnd}
              onChange={e => setDateAvailableEnd(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Dejar vacío para paquetes permanentes</p>
          </div>
        </div>

        {/* Orden */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Orden</label>
          <input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={e => setSortOrder(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Activo */}
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Activo</label>
        </div>

        {/* Subida de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del paquete (opcional)</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Upload className="mr-2 h-4 w-4" />
              Seleccionar imágenes
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
            <span className="text-sm text-gray-500">{images.length} archivos seleccionados</span>
          </div>
          {uploadingImages && (
            <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
              Subiendo imágenes...
            </div>
          )}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {imagePreviews.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/packages')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading || uploadingImages ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear paquete')}
          </button>
        </div>
      </form>
    </div>
  );
}