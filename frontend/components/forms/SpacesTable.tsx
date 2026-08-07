'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Space } from '@/src/types/services';
import { deleteSpace } from '@/lib/api/spaces';

interface Props {
  initialSpaces: Space[];
}

export default function SpacesTable({ initialSpaces }: Props) {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    // Confirmación con diálogo personalizado (más amigable que el confirm nativo)
    if (!window.confirm('¿Estás seguro de eliminar este espacio? Esta acción no se puede deshacer.')) return;

    setLoadingId(id);
    setError(null);

    try {
      await deleteSpace(id);
      // Actualizamos el estado local (la fila se irá con animación de salida)
      setSpaces((prev) => prev.filter((space) => space.id !== id));
      router.refresh(); // Actualiza el contenido del servidor
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // Variantes para animación de filas (stagger)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Título y acciones (opcional) */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📋 Espacios
          <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {spaces.length}
          </span>
        </h2>
        <Link
          href="/spaces/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="mr-1">+</span> Nuevo
        </Link>
      </div>

      {/* Mensaje de error animado */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2"
          >
            <span>⚠️</span> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {spaces.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-500 text-lg">No hay espacios creados todavía.</p>
            <Link
              href="/spaces/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
            >
              Crear el primer espacio →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <motion.tbody
                className="bg-white divide-y divide-gray-100"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {spaces.map((space) => (
                    <motion.tr
                      key={space.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="hover:bg-gray-50/70 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-800">{space.title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span
                          className="text-gray-600 block max-w-xs truncate"
                          title={space.description || ''}
                        >
                          {space.description || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            space.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-1.5 ${
                              space.is_active ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          {space.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/spaces/${space.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(space.id)}
                            disabled={loadingId === space.id}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {loadingId === space.id ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4 text-red-600"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                <span className="sr-only">Eliminando...</span>
                              </>
                            ) : (
                              'Eliminar'
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}