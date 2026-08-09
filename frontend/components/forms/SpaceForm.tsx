// components/forms/SpaceForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Space, SpaceCreate } from '@/src/types/services';
import { createSpace, updateSpace } from '@/lib/api/spaces';
import SpaceImageGallery from './SpaceImageGallery';
import { motion } from 'framer-motion';

interface SpaceFormProps {
  initialData?: Space; // Si se pasa, estamos en modo edición
}

export default function SpaceForm({ initialData }: SpaceFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData?.id;

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setIsActive(initialData.is_active ?? true);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: SpaceCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
        is_active: isActive,
      };

      if (isEditMode) {
        await updateSpace(initialData.id, data);
      } else {
        await createSpace(data);
      }

      router.push('/spaces');
      router.refresh(); // Refresca la lista de espacios
    } catch (err: any) {
      setError(err.message || 'Error al guardar el espacio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Editar espacio' : 'Nuevo espacio'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
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
            placeholder="Ej: Salón Principal"
          />
        </div>

        {/* Descripción */}
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
            placeholder="Descripción del espacio..."
          />
        </div>

        {/* Activo */}
        <div className="flex items-center">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Espacio activo
          </label>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm bg-red-50 p-2 rounded"
          >
            {error}
          </motion.p>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/spaces')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>

      {/* Galería de imágenes (solo en modo edición) */}
      {isEditMode && (
        <div className="mt-8">
          <SpaceImageGallery
            spaceId={initialData.id}
            onImagesChange={() => {
              router.refresh();
            }}
          />
        </div>
      )}
    </motion.div>
  );
}