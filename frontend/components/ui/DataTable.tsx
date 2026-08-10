'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Plus } from 'lucide-react';

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export interface ActionDef<T> {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: (item: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: ActionDef<T>[];
  onDelete?: (item: T) => Promise<void>;
  rowKey?: keyof T;
  emptyMessage?: string;
  title?: string;
  createLink?: string;
  createLabel?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  onDelete,
  rowKey = 'id',
  emptyMessage = 'No hay registros disponibles.',
  title,
  createLink,
  createLabel = 'Nuevo',
  loading = false,
  onRefresh,
}: DataTableProps<T>) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (item: T) => {
    if (!onDelete) return;
    if (!window.confirm('¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.')) return;

    const id = item[rowKey];
    setLoadingId(id);
    setError(null);
    try {
      await onDelete(item);
      if (onRefresh) onRefresh();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

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
      {/* Título y acciones */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {title || 'Listado'}
          <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {data.length}
          </span>
        </h2>
        {createLink && (
          <Link
            href={createLink}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            {createLabel}
          </Link>
        )}
      </div>

      {/* Errores */}
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
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-500 text-lg">{emptyMessage}</p>
            {createLink && (
              <Link
                href={createLink}
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
              >
                Crear el primer registro →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80 backdrop-blur-sm">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                        col.className || ''
                      } ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                  {(actions.length > 0 || onDelete) && (
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <motion.tbody
                className="bg-white divide-y divide-gray-100"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {data.map((item) => {
                    const id = item[rowKey];
                    const isDeleting = loadingId === id;
                    return (
                      <motion.tr
                        key={id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="hover:bg-gray-50/70 transition-colors duration-150"
                      >
                        {columns.map((col) => (
                          <td
                            key={String(col.key)}
                            className={`px-6 py-4 whitespace-nowrap ${
                              col.className || ''
                            } ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                          >
                            {col.render ? col.render(item) : item[col.key]}
                          </td>
                        ))}
                        {(actions.length > 0 || onDelete) && (
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-3">
                              {actions.map((action) => (
                                <button
                                  key={action.label}
                                  onClick={() => action.onClick(item)}
                                  disabled={action.disabled?.(item) || isDeleting}
                                  className={`text-sm font-medium transition-colors ${action.className || ''}`}
                                >
                                  {action.icon || action.label}
                                </button>
                              ))}
                              {onDelete && (
                                <button
                                  onClick={() => handleDelete(item)}
                                  disabled={isDeleting}
                                  className="text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  {isDeleting ? (
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
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}