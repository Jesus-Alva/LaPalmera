'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, ImagePlus } from 'lucide-react';
import CategorySelector from './CategorySelector';
import { uploadImage } from '@/lib/api/gallery';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCategoryId?: number;
  token: string;
}

interface PendingFile {
  file: File;
  preview: string;
}

export default function ImageUploadModal({ isOpen, onClose, onSuccess, defaultCategoryId, token }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(defaultCategoryId || null);
  const [altText, setAltText] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');

  const resetState = () => {
    pendingFiles.forEach(p => URL.revokeObjectURL(p.preview));
    setPendingFiles([]);
    setAltText('');
    setError('');
    setProgress({ done: 0, total: 0 });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const newFiles = Array.from(selected).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setPendingFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setError('Selecciona una categoría');
      return;
    }
    if (pendingFiles.length === 0) {
      setError('Selecciona al menos una imagen');
      return;
    }
    setLoading(true);
    setError('');
    setProgress({ done: 0, total: pendingFiles.length });

    const results = await Promise.allSettled(
      pendingFiles.map(async ({ file }) => {
        const formData = new FormData();
        formData.append('category_id', String(selectedCategory));
        formData.append('file', file);
        if (altText) formData.append('alt_text', altText);
        await uploadImage(formData, token);
        setProgress(prev => ({ ...prev, done: prev.done + 1 }));
      })
    );

    setLoading(false);
    const failedCount = results.filter(r => r.status === 'rejected').length;

    if (failedCount === 0) {
      onSuccess();
      onClose();
      resetState();
    } else if (failedCount < results.length) {
      onSuccess();
      setError(`${failedCount} de ${results.length} imágenes no se pudieron subir. Reintenta con las restantes.`);
      setPendingFiles(prev => {
        const succeeded = prev.filter((_, i) => results[i].status === 'fulfilled');
        succeeded.forEach(p => URL.revokeObjectURL(p.preview));
        return prev.filter((_, i) => results[i].status === 'rejected');
      });
    } else {
      setError('No se pudo subir ninguna imagen');
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Subir imágenes a galería</h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <CategorySelector
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Seleccionar categoría"
                  token={token}
                />
              </div>

              {/* Previsualización múltiple */}
              {pendingFiles.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {pendingFiles.map((p, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                      <img src={p.preview} alt={p.file.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs mt-1">Añadir</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="relative flex flex-col items-center justify-center w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors">
                  <Upload className="h-12 w-12 mb-2" />
                  <p>Selecciona una o varias imágenes</p>
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                </label>
              )}

              <div>
                <label htmlFor="altText" className="block text-sm font-medium text-gray-700">Texto alternativo (alt)</label>
                <input
                  id="altText"
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de la imagen (se aplica a todas)"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || pendingFiles.length === 0 || !selectedCategory}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo {progress.done}/{progress.total}
                    </>
                  ) : (
                    `Subir ${pendingFiles.length > 1 ? `${pendingFiles.length} imágenes` : 'imagen'}`
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
