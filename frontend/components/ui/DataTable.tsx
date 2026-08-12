// components/ui/DataTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ColumnDef, ActionDef } from '@/types/table';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: ActionDef<T>[];
  onDelete?: (item: T) => Promise<void>;
  resourceName?: string; // para mensajes
  newItemLink?: string;
  emptyMessage?: string;
  loading?: boolean;
  rowKey?: keyof T | string; // por defecto 'id'
  className?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  onDelete,
  resourceName = 'elemento',
  newItemLink,
  emptyMessage = `No hay ${resourceName}s creados.`,
  loading = false,
  rowKey = 'id',
  className = '',
}: DataTableProps<T>) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (item: T) => {
    const id = item[rowKey];
    if (!id) return;
    if (!window.confirm(`¿Estás seguro de eliminar este ${resourceName}? Esta acción no se puede deshacer.`)) return;

    setLoadingId(id);
    setError(null);
    try {
      if (onDelete) {
        await onDelete(item);
        // Si el padre no actualiza data, lo hacemos localmente (opcional)
        // router.refresh();
      }
      router.refresh(); // O forzar recarga
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    } finally {
      setLoadingId(null);
    }
  };

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  // Función para renderizar el valor de una celda
  const renderCell = (item: T, col: ColumnDef<T>) => {
    if (col.render) return col.render(item);
    const value = item[col.key as keyof T];
    // Si es null o undefined, mostramos un guión
    return value !== undefined && value !== null ? String(value) : '—';
  };

  return (
    <div className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Header con título y botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📋 {resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}s
          <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {data.length}
          </span>
        </h2>
        {newItemLink && (
          <Link
            href={newItemLink}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="mr-1">+</span> Nuevo
          </Link>
        )}
      </div>

      {/* Error */}
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
          <div className="text-center py-16 px-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Cargando...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-500 text-lg">{emptyMessage}</p>
            {newItemLink && (
              <Link href={newItemLink} className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                Generar {resourceName} →
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
                      scope="col"
                      className={`px-6 py-4 text-${col.align || 'left'} text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                        col.sortable ? 'cursor-pointer hover:text-gray-800' : ''
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                  {(actions.length > 0 || onDelete) && (
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                            className={`px-6 py-4 whitespace-nowrap text-${col.align || 'left'} text-sm text-gray-700`}
                          >
                            {renderCell(item, col)}
                          </td>
                        ))}
                        {(actions.length > 0 || onDelete) && (
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-3">
                              {/* Acciones personalizadas */}
                              {actions.map((action, idx) => {
                                const isVisible = action.visible ? action.visible(item) : true;
                                if (!isVisible) return null;
                                const isDisabled = action.disabled ? action.disabled(item) : false;
                                const isLoading = action.loading ? action.loading(item) : false;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => action.onClick(item)}
                                    disabled={isDisabled || isLoading}
                                    className={`font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
                                      action.variant === 'danger'
                                        ? 'text-red-600 hover:text-red-800'
                                        : action.variant === 'warning'
                                        ? 'text-yellow-600 hover:text-yellow-800'
                                        : action.variant === 'info'
                                        ? 'text-blue-600 hover:text-blue-800'
                                        : 'text-blue-600 hover:text-blue-800'
                                    }`}
                                  >
                                    {isLoading ? (
                                      <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="sr-only">Cargando...</span>
                                      </>
                                    ) : (
                                      action.icon && <span>{action.icon}</span>
                                    )}
                                    {action.label}
                                  </button>
                                );
                              })}
                              {/* Eliminar (si onDelete está definido) */}
                              {onDelete && (
                                <button
                                  onClick={() => handleDelete(item)}
                                  disabled={isDeleting}
                                  className="text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  {isDeleting ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                      </svg>
                                      <span className="sr-only">Eliminando...</span>
                                    </>
                                  ) : (
                                    'Eliminar'
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