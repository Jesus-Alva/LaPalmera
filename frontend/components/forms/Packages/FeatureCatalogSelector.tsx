'use client';

import { useState } from 'react';
import { PackageFeatureCatalog } from '@/src/types/packageFeatureCatalog';
import { createPackageFeatureCatalogItem } from '@/lib/api/packageFeatureCatalog';
import { List, PlusCircle, Loader2, Sparkles } from 'lucide-react';

interface Props {
  catalog: PackageFeatureCatalog[];
  value: number | null;
  onChange: (catalogId: number) => void;
  onCatalogCreated: (item: PackageFeatureCatalog) => void;
}

type Mode = 'existing' | 'new';

export default function FeatureCatalogSelector({ catalog, value, onChange, onCatalogCreated }: Props) {
  const [mode, setMode] = useState<Mode>(catalog.length === 0 ? 'new' : 'existing');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const created = await createPackageFeatureCatalogItem({ name: newName.trim() });
      onCatalogCreated(created);
      onChange(created.id);
      setNewName('');
      setMode('existing');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear característica');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="inline-flex p-1 bg-gray-100 rounded-full">
        <button
          type="button"
          onClick={() => setMode('existing')}
          disabled={catalog.length === 0}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === 'existing' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List className="h-3 w-3" />
          Elegir
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            mode === 'new' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PlusCircle className="h-3 w-3" />
          Nueva
        </button>
      </div>

      {mode === 'existing' ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecciona una característica...</option>
          {catalog.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleCreate();
              }
            }}
            placeholder="Ej. Capacidad, Duración..."
            className="block w-full px-3 py-2 border border-blue-200 bg-blue-50/40 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => handleCreate()}
            disabled={creating || !newName.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap text-sm"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Crear
          </button>
        </div>
      )}
    </div>
  );
}
