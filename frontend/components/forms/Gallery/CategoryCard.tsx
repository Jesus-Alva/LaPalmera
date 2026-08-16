'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryCategory } from '@/src/types/gallery';
import { deleteCategory } from '@/lib/api/gallery';
import { Edit, Trash2, Image as ImageIcon, Plus } from 'lucide-react';

interface Props {
  category: GalleryCategory;
  onDelete?: () => void;
}

export default function CategoryCard({ category, onDelete }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteCategory(category.id);
      if (onDelete) onDelete();
      router.refresh();
    } catch (error) {
      alert('Error al eliminar categoría');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="p-5">
        <h3 className="font-semibold text-xl text-gray-800">{category.name}</h3>
        <p className="text-sm text-gray-500">Slug: {category.slug}</p>
        <p className="text-sm text-gray-500">Orden: {category.sort_order}</p>
        <div className="flex items-center gap-1 text-sm text-gray-400 mt-2">
          <ImageIcon className="w-4 h-4" />
          <span>{category.images?.length || 0} imágenes</span>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
        <button
          onClick={() => router.push(`/gallery/${category.id}`)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ver imágenes
        </button>
        <button
          onClick={() => router.push(`/gallery/${category.id}/edit`)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {isDeleting ? '...' : 'Eliminar'}
        </button>
      </div>
    </div>
  );
}