// app/(dashboard)/gallery/categories/page.tsx
import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getCategories } from '@/lib/api/gallery';
import CategoryCard from '@/components/forms/Gallery/CategoryCard';

export default async function CategoriesPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const categories = await getCategories(token);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📸 Galería
          <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {categories.length}
          </span>
        </h1>
        <a
          href="/gallery/categories/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="mr-1">+</span> Nueva categoría
        </a>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
          <p className="text-gray-500 text-lg">No hay categorías de galería.</p>
          <a href="/gallery/categories/new" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
            Crear la primera categoría →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}