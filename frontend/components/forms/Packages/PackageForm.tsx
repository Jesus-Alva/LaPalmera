// components/PackageForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePersistedForm } from '@/lib/hooks/usePersistedForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, PackageCreate } from '@/src/types/package';
import { Celebration } from '@/src/types/celebration';
import { createPackage, updatePackage } from '@/lib/api/packages';
import { getOrCreateCatalogForPackage, uploadImage } from '@/lib/api/images';
import { Upload, X, Plus } from 'lucide-react';
import Image from 'next/image';
import MilestoneProgressBar from '@/components/ui/MilestoneProgressBar';

interface Props {
  initialData?: Package;
  celebrations: Celebration[];
}

interface FormData {
  title: string;
  shortDescription: string;
  celebrationId: number;
  sortOrder: number;
  isActive: boolean;
  dateAvailableStart: string;
  dateAvailableEnd: string;
  features: { feature_key: string; feature_value: string }[];
}

export default function PackageForm({ initialData, celebrations }: Props) {
  const router = useRouter();
  const isEditing = !!initialData?.id;
  const storageKey = `package_form_${isEditing ? `edit_${initialData.id}` : 'new'}`;

  const defaultData: FormData = {
    title: initialData?.title || '',
    shortDescription: initialData?.short_description || '',
    celebrationId: initialData?.celebration_id || 0,
    sortOrder: initialData?.sort_order || 0,
    isActive: initialData?.is_active ?? true,
    dateAvailableStart: initialData?.date_available_start
      ? new Date(initialData.date_available_start).toISOString().split('T')[0]
      : '',
    dateAvailableEnd: initialData?.date_available_end
      ? new Date(initialData.date_available_end).toISOString().split('T')[0]
      : '',
    features: initialData?.features?.map(f => ({ feature_key: f.feature_key, feature_value: f.feature_value })) || [],
  };

  const {
    data: persistedData,
    updateData,
    step,
    setStep,
    isRestored,
    clearPersistedData,
  } = usePersistedForm<FormData>(storageKey, defaultData, 1);

  // Estado local para imágenes (no se persisten)
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 3;
  const stepLabels = ['Información', 'Características', 'Imágenes'];

  // Funciones para manejar cambios en campos individuales
  const handleFieldChange = (field: keyof FormData, value: any) => {
    updateData({ [field]: value });
  };

  // Funciones para características
  const addFeature = () => {
    const updatedFeatures = [...persistedData.features, { feature_key: '', feature_value: '' }];
    updateData({ features: updatedFeatures });
  };

  const updateFeature = (index: number, field: 'feature_key' | 'feature_value', value: string) => {
    const updated = [...persistedData.features];
    updated[index][field] = value;
    updateData({ features: updated });
  };

  const removeFeature = (index: number) => {
    const updated = persistedData.features.filter((_, i) => i !== index);
    updateData({ features: updated });
  };

  // Funciones para imágenes
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Validación por pasos
  const validateStep = (): boolean => {
    setError('');
    if (step === 1) {
      if (!persistedData.title.trim()) {
        setError('El título es obligatorio');
        return false;
      }
      if (!persistedData.celebrationId) {
        setError('Selecciona una celebración');
        return false;
      }
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < persistedData.features.length; i++) {
        if (!persistedData.features[i].feature_key.trim() || !persistedData.features[i].feature_value.trim()) {
          setError('Todos los campos de características deben estar completos');
          return false;
        }
      }
      return true;
    }
    return true;
  };

  // Navegación con prevención de submit
  const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (validateStep()) {
      setStep(Math.min(step + 1, totalSteps));
    }
  };

  const prevStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep(Math.max(step - 1, 1));
  };

  // Prevenir submit con Enter en los pasos 1 y 2
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault();
    }
  };

  // Submit final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateStep()) {
        setLoading(false);
        return;
      }

      if (!persistedData.celebrationId) {
        throw new Error('Selecciona una celebración');
      }

      const data: PackageCreate = {
        title: persistedData.title,
        short_description: persistedData.shortDescription || undefined,
        celebration_id: persistedData.celebrationId,
        sort_order: persistedData.sortOrder,
        is_active: persistedData.isActive,
        date_available_start: persistedData.dateAvailableStart || null,
        date_available_end: persistedData.dateAvailableEnd || null,
        features: persistedData.features.map(f => ({
          feature_key: f.feature_key,
          feature_value: f.feature_value,
        })),
      };

      let packageResult;
      if (initialData) {
        packageResult = await updatePackage(initialData.id, data);
      } else {
        packageResult = await createPackage(data);
      }

      if (images.length > 0) {
        setUploadingImages(true);
        const catalog = await getOrCreateCatalogForPackage(packageResult.id);
        for (const file of images) {
          await uploadImage(catalog.id, file);
        }
        setUploadingImages(false);
      }

      clearPersistedData();
      router.push('/packages');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar cada paso
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título *</label>
              <input
                id="title"
                type="text"
                required
                value={persistedData.title}
                onChange={e => handleFieldChange('title', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Descripción corta</label>
              <textarea
                id="shortDescription"
                rows={3}
                value={persistedData.shortDescription}
                onChange={e => handleFieldChange('shortDescription', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="celebration" className="block text-sm font-medium text-gray-700">Celebración *</label>
              <select
                id="celebration"
                required
                value={persistedData.celebrationId}
                onChange={e => handleFieldChange('celebrationId', Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="0">Selecciona una celebración...</option>
                {celebrations.map(celebration => (
                  <option key={celebration.id} value={celebration.id}>
                    {celebration.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha de inicio (opcional)</label>
                <input
                  id="startDate"
                  type="date"
                  value={persistedData.dateAvailableStart}
                  onChange={e => handleFieldChange('dateAvailableStart', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Dejar vacío para paquetes permanentes</p>
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha de fin (opcional)</label>
                <input
                  id="endDate"
                  type="date"
                  value={persistedData.dateAvailableEnd}
                  onChange={e => handleFieldChange('dateAvailableEnd', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Dejar vacío para paquetes permanentes</p>
              </div>
            </div>

            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Orden</label>
              <input
                id="sortOrder"
                type="number"
                value={persistedData.sortOrder}
                onChange={e => handleFieldChange('sortOrder', Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={persistedData.isActive}
                onChange={e => handleFieldChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Activo</label>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Características del paquete</h3>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </button>
            </div>

            {persistedData.features.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No hay características agregadas. Haz clic en "Añadir" para comenzar.</p>
            )}

            <AnimatePresence>
              {persistedData.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-4 items-end border-b border-gray-100 pb-4"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Clave</label>
                    <input
                      type="text"
                      value={feature.feature_key}
                      onChange={(e) => updateFeature(index, 'feature_key', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Capacidad"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Valor</label>
                    <input
                      type="text"
                      value={feature.feature_value}
                      onChange={(e) => updateFeature(index, 'feature_value', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 100 personas"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del paquete (opcional)</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="mr-2 h-4 w-4" />
                  Seleccionar imágenes
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
                <span className="text-sm text-gray-500">{images.length} archivos seleccionados</span>
              </div>

              {uploadingImages && (
                <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  Subiendo imágenes...
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Editar paquete' : 'Nuevo paquete'}
        {isRestored && (
          <span className="ml-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            ✦ Datos recuperados
          </span>
        )}
      </h2>

      <MilestoneProgressBar currentStep={step} steps={stepLabels} />

      {/* Formulario con manejo de teclado */}
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm"
          >
            {error}
          </motion.p>
        )}

        {/* Navegación entre pasos - FUERA del formulario */}
        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            onClick={prevStep}
            className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${step === 1 ? 'invisible' : ''}`}
          >
            Anterior
          </button>

          <div className="flex gap-3">
            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading || uploadingImages ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear paquete')}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (confirm('¿Seguro que quieres cancelar? Se perderán los cambios no guardados.')) {
                  clearPersistedData();
                  router.push('/packages');
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}