// components/PackageForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, PackageCreate } from '@/src/types/package';
import { Celebration } from '@/src/types/celebration';
import { createPackage, updatePackage } from '@/lib/api/packages';
import { getCelebrations } from '@/lib/api/celebrations';
import { getServerToken } from '@/app/lib/auth';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface Props {
  initialData?: Package;
}

export default function PackageForm({ initialData }: Props) {
  const router = useRouter();
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [loadingCelebrations, setLoadingCelebrations] = useState(true);
  const [title, setTitle] = useState(initialData?.title || '');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [celebrationId, setCelebrationId] = useState<number>(initialData?.celebration_id || 0);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [dataAvailableStart, setDataAvailableStart] = useState(initialData?.data_available_start || '');
  const [dataAvailableEnd, setDataAvailableEnd] = useState(initialData?.data_available_end || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Cargar celebraciones
  useEffect(() => {
    const loadCelebrations = async () => {
      try {
        const token = await getServerToken();
        const data = await getCelebrations(token);
        setCelebrations(data);
      } catch (err) {
        console.error('Error cargando celebraciones:', err);
      } finally {
        setLoadingCelebrations(false);
      }
    };
    loadCelebrations();
  }, []);

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

      const data: PackageCreate = {
        title,
        short_description: shortDescription || undefined,
        celebration_id: celebrationId,
        sort_order: sortOrder,
        is_active: isActive,
        data_available_start: dataAvailableStart || null,
        data_available_end: dataAvailableEnd || null,
      };

      let packageResult;
      if (initialData) {
        packageResult = await updatePackage(initialData.id, data);
      } else {
        packageResult = await createPackage(data);
      }

      // Subir imágenes si hay (la lógica será similar a la de Spaces)
      // Por ahora, solo guardamos el paquete (las imágenes se manejarán en otro paso)

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

        <div>
          <label htmlFor="celebration" className="block text-sm font-medium text-gray-700">Celebración *</label>
          <select
            id="celebration"
            required
            value={celebrationId}
            onChange={e => setCelebrationId(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={loadingCelebrations}
          >
            <option value="0">Selecciona una celebración...</option>
            {celebrations.map(celebration => (
              <option key={celebration.id} value={celebration.id}>
                {celebration.title}
              </option>
            ))}
          </select>
          {loadingCelebrations && <p className="text-xs text-gray-500 mt-1">Cargando celebraciones...</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha de inicio (opcional)</label>
            <input
              id="startDate"
              type="date"
              value={dataAvailableStart}
              onChange={e => setDataAvailableStart(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Dejar vacío para paquetes permanentes</p>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha de fin (opcional)</label>
            <input
              id="endDate"
              type="date"
              value={dataAvailableEnd}
              onChange={e => setDataAvailableEnd(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Dejar vacío para paquetes permanentes</p>
          </div>
        </div>

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

        {/* Área de subida de imágenes (similar a Spaces) */}
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
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {imagePreviews.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
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
            disabled={loading || loadingCelebrations}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear paquete')}
          </button>
        </div>
      </form>
    </div>
  );
}