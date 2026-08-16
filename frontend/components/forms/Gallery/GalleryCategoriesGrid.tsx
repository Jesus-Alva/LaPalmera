'use client';
import { useRouter } from 'next/navigation';
import { GalleryCategory } from '@/src/types/gallery';
import { deleteGalleryCategory } from '@/lib/api/gallery';
import { motion } from 'framer-motion';

interface Props {
  categories: GalleryCategory[];
}

export default function GalleryCategoriesGrid({ categories }: Props) {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await deleteGalleryCategory(id);
      router.refresh();
    } catch (error) {
      alert('Error al eliminar categoría');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Galería - Categorías</h1>
        <a
          href="/gallery/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nueva categoría
        </a>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500">No hay categorías creadas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition"
            >
              <div className="p-5">
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <p className="text-sm text-gray-500">Slug: {cat.slug}</p>
                <p className="text-sm text-gray-500">Imágenes: {cat.images?.length || 0}</p>
                <div className="flex gap-2 mt-4">
                  <a
                    href={`/gallery/${cat.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver imágenes
                  </a>
                  <a
                    href={`/gallery/${cat.id}/edit`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Editar
                  </a>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}