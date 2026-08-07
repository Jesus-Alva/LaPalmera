'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Space, SpaceCreate } from '@/src/types/services';
import { createSpace, updateSpace } from '@/lib/api/spaces';

interface Props {
  initialData?: Space;
}

export default function SpaceForm({ initialData }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: SpaceCreate = { title, description: description || undefined, is_active: isActive };
      if (initialData) {
        await updateSpace(initialData.id, data);
      } else {
        await createSpace(data);
      }
      router.push('/spaces');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Variantes de animación para los campos
  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
    >
      <motion.h2
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2"
      >
        {initialData ? '✏️ Editar espacio' : '✨ Nuevo espacio'}
      </motion.h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Título */}
        <motion.div variants={fieldVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Ej. Proyecto de diseño"
          />
        </motion.div>

        {/* Campo Descripción */}
        <motion.div variants={fieldVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
            placeholder="Cuéntanos de qué trata este espacio..."
          />
        </motion.div>

        {/* Toggle Activo */}
        <motion.div
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
        >
          <span className="text-sm font-medium text-gray-700">Estado</span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isActive ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </motion.div>

        {/* Mensaje de error con animación */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2"
            >
              <span>⚠️</span> {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Botones */}
        <motion.div
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-end gap-3 pt-2"
        >
          <motion.button
            type="button"
            onClick={() => router.push('/spaces')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Cancelar
          </motion.button>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative px-6 py-2.5 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px]"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              <>{initialData ? 'Actualizar' : 'Crear'}</>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}