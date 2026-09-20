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

interface GalleryPageClientProps {
    token: string;
}

export default function GalleryPageClient({ token }: GalleryPageClientProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<GalleryCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(Boolean(token));
    const [error, setError] = useState(token ? '' : 'No autenticado');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        if (!token) return;
        const loadData = async () => {
            try {
                const cats = await getCategories(token);
                setCategories(cats);
                setSelectedCategory((current) => current ?? cats[0]?.id ?? null);
            } catch {
                setError('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        void loadData();
    }, [token]);

    useEffect(() => {
        if (!token || selectedCategory === null) return;
        const loadImages = async () => {
            try {
                setImages(await getImages(token, selectedCategory));
            } catch {
                setError('Error al cargar imágenes');
            }
        };
        void loadImages();
    }, [selectedCategory, token]);

    const refreshData = async () => {
        if (!token) return;
        const cats = await getCategories(token);
        setCategories(cats);
        setSelectedCategory((current) => current ?? cats[0]?.id ?? null);
    };

    const handleDeleteCategory = async (id: number) => {
        if (!token || !(await confirmAction({ text: '¿Eliminar esta categoría y todas sus imágenes?' }))) return;
        try {
            await deleteCategory(id, token);
            setCategories((prev) => prev.filter((category) => category.id !== id));
            setSelectedCategory((current) => current === id ? null : current);
            router.refresh();
        } catch (err: unknown) {
            showErrorAlert(err instanceof Error ? err.message : 'Error al eliminar categoría');
        }
    };

    const handleDeleteImage = async (id: number) => {
        if (!token || !(await confirmAction({ text: '¿Eliminar esta imagen?' }))) return;
        try {
            await deleteImage(id, token);
            setImages((prev) => prev.filter((image) => image.id !== id));
            router.refresh();
        } catch (err: unknown) {
            showErrorAlert(err instanceof Error ? err.message : 'Error al eliminar imagen');
        }
    };

    const handleUpdateCategory = async (id: number) => {
        if (!token || !editingName.trim()) return;
        try {
            await updateCategory(id, { name: editingName.trim() }, token);
            setCategories((prev) => prev.map((category) => category.id === id
                ? { ...category, name: editingName.trim() }
                : category));
            setEditingCategory(null);
            router.refresh();
        } catch (err: unknown) {
            showErrorAlert(err instanceof Error ? err.message : 'Error al actualizar categoría');
        }
    };

    const handleUploadSuccess = () => {
        void refreshData();
        router.refresh();
    };

    const selectedCategoryData = categories.find((category) => category.id === selectedCategory);
    const hasRegisteredImages = categories.some((category) => (category.image_count ?? 0) > 0);

    if (loading) {
        return <div className="flex items-center justify-center min-h-100"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">📸 Galería de Imágenes</h1>
                <button onClick={() => setShowUploadModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />Subir imagen o crear categoria
                </button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

            <div className="mb-6 flex flex-wrap gap-2">
                {categories.map((category) => (
                    <div key={category.id} className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${selectedCategory === category.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        {editingCategory === category.id ? (
                            <form onSubmit={(event) => { event.preventDefault(); void handleUpdateCategory(category.id); }} className="flex items-center gap-1">
                                <input type="text" value={editingName} onChange={(event) => setEditingName(event.target.value)} className="px-2 py-1 text-sm border rounded" autoFocus />
                                <button type="submit" className="text-green-600 hover:text-green-800">✓</button>
                                <button type="button" onClick={() => setEditingCategory(null)} className="text-red-600 hover:text-red-800">✕</button>
                            </form>
                        ) : (
                            <>
                                <button onClick={() => setSelectedCategory(category.id)} className="text-sm font-medium">{category.name}<span className="ml-1 text-xs text-gray-400">({category.image_count || 0})</span></button>
                                <button onClick={() => { setEditingCategory(category.id); setEditingName(category.name); }} className="text-gray-400 hover:text-blue-600"><Edit2 className="h-3 w-3" /></button>
                                <button onClick={() => void handleDeleteCategory(category.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {!hasRegisteredImages ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
                    <p className="text-gray-500 text-lg">Aún no hay categorias con imagenes registradas.</p>
                    <button onClick={() => setShowUploadModal(true)} className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">Crear las primeras imagenes →</button>
                </div>
            ) : selectedCategory ? (
                <>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">{selectedCategoryData?.name || 'Categoría'} - {images.length} imágenes</h2>
                    {images.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">No hay imágenes en esta categoría</p>
                            <button onClick={() => setShowUploadModal(true)} className="mt-4 text-blue-600 hover:text-blue-800 font-medium">Subir la primera imagen</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((image) => (
                                <motion.div key={image.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 shadow hover:shadow-lg transition-shadow">
                                    <Image src={`${process.env.NEXT_PUBLIC_API_URL}${image.image_path}`} alt={image.alt_text || 'Imagen de galería'} fill className="object-cover" unoptimized />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => void handleDeleteImage(image.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                    {image.alt_text && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">{image.alt_text}</div>}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            ) : null}

            <ImageUploadModal 
            isOpen={showUploadModal} 
            onClose={() => setShowUploadModal(false)} 
            onSuccess={handleUploadSuccess} 
            defaultCategoryId={selectedCategory || undefined}
            token={token}
             />
        </div>
    );
}
