'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryCategory, GalleryCategoryCreate } from '@/src/types/gallery';
import { createGalleryCategory, updateGalleryCategory } from '@/lib/api/gallery';

interface Props {
  initialData?: GalleryCategory;
}

export default function GalleryCategoryForm({ initialData }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data: GalleryCategoryCreate = { name, slug, sort_order: sortOrder };
      if (initialData) {
        await updateGalleryCategory(initialData.id, data); // sin token
      } else {
        await createGalleryCategory(data); // sin token
      }
      router.push('/gallery');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Editar categoría' : 'Nueva categoría'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug *</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="ej: bodas"
          />
          <p className="text-xs text-gray-400">Identificador único para la URL</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Orden</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/gallery')}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}