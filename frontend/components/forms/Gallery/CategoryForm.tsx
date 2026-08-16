// components/gallery/CategoryForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryCategory, GalleryCategoryCreate } from '@/src/types/gallery';
import { createCategory, updateCategory } from '@/lib/api/gallery';

interface Props {
  initialData?: GalleryCategory;
}

export default function CategoryForm({ initialData }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generar slug a partir del nombre
  const handleNameChange = (value: string) => {
    setName(value);
    if (!initialData) {
      // Solo en creación, autogenerar slug
      const generatedSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: GalleryCategoryCreate = {
        name,
        slug,
        sort_order: sortOrder,
      };

      if (initialData) {
        await updateCategory(initialData.id, data);
      } else {
        await createCategory(data);
      }

      router.push('/gallery/categories');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Editar categoría' : 'Nueva categoría'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug *</label>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Identificador único para la URL (ej: "bodas", "cumpleanos")</p>
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

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/gallery/categories')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}