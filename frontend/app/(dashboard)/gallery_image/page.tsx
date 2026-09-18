'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, getImages, deleteCategory, deleteImage, updateCategory } from '@/lib/api/gallery';
import { GalleryCategory, GalleryImage } from '@/src/types/gallery';
import ImageUploadModal from '@/components/forms/Gallery/ImageUploadModal';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { confirmAction, showErrorAlert } from '@/lib/alerts';

export default function GalleryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id);
      }
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (categoryId: number) => {
    try {
      const imgs = await getImages(undefined, categoryId);
      setImages(imgs);
    } catch {
      setError('Error al cargar imágenes');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadImages(selectedCategory);
    }
  }, [selectedCategory]);

  const handleDeleteCategory = async (id: number) => {
    if (!(await confirmAction({ text: '¿Eliminar esta categoría y todas sus imágenes?' }))) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      if (selectedCategory === id) {
        setSelectedCategory(categories.length > 1 ? categories[0].id : null);
      }
      router.refresh();
    } catch (err: unknown) {
      showErrorAlert(err instanceof Error ? err.message : 'Error al eliminar categoría');
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!(await confirmAction({ text: '¿Eliminar esta imagen?' }))) return;
    try {
      await deleteImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
      router.refresh();
    } catch (err: unknown) {
      showErrorAlert(err instanceof Error ? err.message : 'Error al eliminar imagen');
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      await updateCategory(id, { name: editingName.trim() });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editingName.trim() } : c));
      setEditingCategory(null);
      router.refresh();
    } catch (err: unknown) {
      showErrorAlert(err instanceof Error ? err.message : 'Error al actualizar categoría');
    }
  };

  const handleUploadSuccess = () => {
    if (selectedCategory) loadImages(selectedCategory);
    loadData(); // actualizar conteos
    router.refresh();
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📸 Galería de Imágenes</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Subir imagen o crear categoria
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Lista de categorías */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
              selectedCategory === cat.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            {editingCategory === cat.id ? (
              <form
                onSubmit={(e) => { e.preventDefault(); handleUpdateCategory(cat.id); }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="px-2 py-1 text-sm border rounded"
                  autoFocus
                />
                <button type="submit" className="text-green-600 hover:text-green-800">✓</button>
                <button type="button" onClick={() => setEditingCategory(null)} className="text-red-600 hover:text-red-800">✕</button>
              </form>
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className="text-sm font-medium"
                >
                  {cat.name}
                  <span className="ml-1 text-xs text-gray-400">({cat.image_count || 0})</span>
                </button>
                <button
                  onClick={() => { setEditingCategory(cat.id); setEditingName(cat.name); }}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Grid de imágenes */}
      {selectedCategory && (
        <>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {selectedCategoryData?.name || 'Categoría'} - {images.length} imágenes
          </h2>
          {images.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No hay imágenes en esta categoría</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Subir la primera imagen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 shadow hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${img.image_path}`}
                    alt={img.alt_text || 'Imagen de galería'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {img.alt_text && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {img.alt_text}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        defaultCategoryId={selectedCategory || undefined}
      />
    </div>
  );
}