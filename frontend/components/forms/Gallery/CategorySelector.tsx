'use client';

import { useState, useEffect } from 'react';
import { GalleryCategory } from '@/src/types/gallery';
import { getCategories, createCategory } from '@/lib/api/gallery';
import { FolderOpen, FolderPlus, Loader2, Sparkles } from 'lucide-react';

interface Props {
  value: number | null;
  onChange: (categoryId: number) => void;
  onCategoryCreated?: (category: GalleryCategory) => void;
  placeholder?: string;
  className?: string;
}

type Mode = 'existing' | 'new';

export default function CategorySelector({ value, onChange, onCategoryCreated, placeholder = 'Seleccionar categoría', className = '' }: Props) {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('existing');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        if (isMounted) {
          setCategories(data);
          if (data.length === 0) setMode('new');
        }
      } catch {
        if (isMounted) {
          setError('Error al cargar categorías');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateCategory = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newCategoryName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const newCat = await createCategory({ name: newCategoryName.trim() });
      setCategories(prev => [...prev, newCat]);
      onChange(newCat.id);
      if (onCategoryCreated) onCategoryCreated(newCat);
      setNewCategoryName('');
      setMode('existing');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Selector de modo */}
      <div className="inline-flex p-1 bg-gray-100 rounded-full">
        <button
          type="button"
          onClick={() => setMode('existing')}
          disabled={categories.length === 0 && !loading}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === 'existing' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Elegir categoría
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === 'new' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FolderPlus className="h-3.5 w-3.5" />
          Crear categoría
        </button>
      </div>

      {mode === 'existing' ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          <option value="">{loading ? 'Cargando...' : placeholder}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      ) : (
        <div className="relative rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">Nueva categoría</p>
              <p className="text-xs text-gray-500">Organiza tus imágenes creando una categoría a la medida</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleCreateCategory();
                }
              }}
              placeholder="Ej. Habitaciones, Eventos, Alberca..."
              className="block w-full px-3 py-2 border border-blue-200 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => handleCreateCategory()}
              disabled={creating || !newCategoryName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
              Crear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
