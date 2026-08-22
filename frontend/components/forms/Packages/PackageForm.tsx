// components/forms/Packages/PackageForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePersistedForm } from '@/lib/hooks/usePersistedForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, PackageCreate } from '@/src/types/package';
import { PackageFeatureCatalog } from '@/src/types/packageFeatureCatalog';
import { createPackage, updatePackage } from '@/lib/api/packages';
import { getPackageFeatureCatalog } from '@/lib/api/packageFeatureCatalog';
import {
  getOrCreateCatalogForPackage,
  uploadImage,
  deleteImage,
  getCatalogByPackageId,
} from '@/lib/api/images';
import { Upload, X, Plus, ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import MilestoneProgressBar from '@/components/ui/MilestoneProgressBar';
import FeatureCatalogSelector from './FeatureCatalogSelector';

interface Props {
  initialData?: Package;
}

interface FormData {
  title: string;
  shortDescription: string;
  sortOrder: number;
  isActive: boolean;
  dateAvailableStart: string;
  dateAvailableEnd: string;
  features: { catalog_id: number; feature_value: string }[];
}

export default function PackageForm({ initialData }: Props) {
  const router = useRouter();
  const isEditing = !!initialData?.id;
  const storageKey = `package_form_${isEditing ? `edit_${initialData.id}` : 'new'}`;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

  // ============ ESTADOS ============
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');

  // Estado para imágenes existentes
  const [existingImages, setExistingImages] = useState<{ id: number; url: string; alt: string }[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Estado para nuevas imágenes (seleccionadas desde el input)
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Catálogo de características disponibles para seleccionar
  const [featureCatalog, setFeatureCatalog] = useState<PackageFeatureCatalog[]>([]);
  const [loadingFeatureCatalog, setLoadingFeatureCatalog] = useState(true);

  // Estado principal del formulario (persistente)
  const defaultData: FormData = {
    title: initialData?.title || '',
    shortDescription: initialData?.short_description || '',
    sortOrder: initialData?.sort_order || 0,
    isActive: initialData?.is_active ?? true,
    dateAvailableStart: initialData?.date_available_start
      ? new Date(initialData.date_available_start).toISOString().split('T')[0]
      : '',
    dateAvailableEnd: initialData?.date_available_end
      ? new Date(initialData.date_available_end).toISOString().split('T')[0]
      : '',
    features: initialData?.features?.map(f => ({ catalog_id: f.catalog_id, feature_value: f.feature_value })) || [],
  };

  const {
    data: persistedData,
    updateData,
    step,
    setStep,
    isRestored,
    clearPersistedData,
  } = usePersistedForm<FormData>(storageKey, defaultData, 1);

  const totalSteps = 3;
  const stepLabels = ['Información', 'Características', 'Imágenes'];

  // ============ FUNCIONES AUXILIARES (declaradas antes del useEffect) ============

  const loadExistingImages = async (packageId: number) => {
    setLoadingImages(true);
    try {
      const catalog = await getCatalogByPackageId(packageId);
      if (catalog && catalog.images) {
        const images = catalog.images.map((img: any) => ({
          id: img.id,
          url: `${baseUrl}${img.image_path}`,
          alt: img.alt_text || 'Imagen del paquete',
        }));
        setExistingImages(images);
      } else {
        setExistingImages([]);
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // ============ EFFECTS ============

  // Cargar el catálogo de características disponibles
  useEffect(() => {
    let isMounted = true;
    const fetchFeatureCatalog = async () => {
      try {
        const data = await getPackageFeatureCatalog();
        if (isMounted) setFeatureCatalog(data);
      } catch (error) {
        console.error('Error cargando catálogo de características:', error);
      } finally {
        if (isMounted) setLoadingFeatureCatalog(false);
      }
    };
    void fetchFeatureCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar imágenes existentes al editar
  useEffect(() => {
    if (isEditing && initialData?.id) {
      const fetchImages = async () => {
        setLoadingImages(true);
        try {
          const catalog = await getCatalogByPackageId(initialData.id);
          if (catalog && catalog.images) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
            const images = catalog.images.map(img => ({
              id: img.id,
              url: `${baseUrl}${img.image_path}`,
              alt: img.alt_text || 'Imagen del paquete',
            }));
            setExistingImages(images);
          }
        } catch (error) {
          console.error('Error cargando imágenes:', error);
        } finally {
          setLoadingImages(false);
        }
      };
      fetchImages();
    }
  }, [isEditing, initialData?.id]);

  // ============ MANEJO DE IMÁGENES ============

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setNewImages(prev => [...prev, ...newFiles]);
    setNewImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageId: number) => {
    if (!confirm('¿Eliminar esta imagen permanentemente?')) return;
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  // ============ MANEJO DE CARACTERÍSTICAS ============

  const addFeature = () => {
    const updatedFeatures = [...persistedData.features, { catalog_id: 0, feature_value: '' }];
    updateData({ features: updatedFeatures });
  };

  const updateFeatureCatalog = (index: number, catalogId: number) => {
    const updated = [...persistedData.features];
    updated[index] = { ...updated[index], catalog_id: catalogId };
    updateData({ features: updated });
  };

  const updateFeatureValue = (index: number, value: string) => {
    const updated = [...persistedData.features];
    updated[index] = { ...updated[index], feature_value: value };
    updateData({ features: updated });
  };

  const removeFeature = (index: number) => {
    const updated = persistedData.features.filter((_, i) => i !== index);
    updateData({ features: updated });
  };

  const handleFeatureCatalogCreated = (item: PackageFeatureCatalog) => {
    setFeatureCatalog(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
  };

  // ============ VALIDACIÓN Y NAVEGACIÓN ============

  const validateStep = (): boolean => {
    setError('');
    if (step === 1) {
      if (!persistedData.title.trim()) {
        setError('El título es obligatorio');
        return false;
      }
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < persistedData.features.length; i++) {
        if (!persistedData.features[i].catalog_id || !persistedData.features[i].feature_value.trim()) {
          setError('Selecciona una característica y completa su valor en todas las filas');
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setStep(Math.min(step + 1, totalSteps));
    }
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep(Math.max(step - 1, 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault();
    }
  };

  // ============ SUBMIT ============

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateStep()) {
        setLoading(false);
        return;
      }

      // 1. Crear/actualizar el paquete
      const data: PackageCreate = {
        title: persistedData.title,
        short_description: persistedData.shortDescription || undefined,
        sort_order: persistedData.sortOrder,
        is_active: persistedData.isActive,
        date_available_start: persistedData.dateAvailableStart || null,
        date_available_end: persistedData.dateAvailableEnd || null,
        features: persistedData.features.map(f => ({
          catalog_id: f.catalog_id,
          feature_value: f.feature_value,
        })),
      };

      let packageResult;
      if (initialData) {
        packageResult = await updatePackage(initialData.id, data);
      } else {
        packageResult = await createPackage(data);
      }

      // 2. Eliminar imágenes marcadas (solo en edición)
      if (isEditing && imagesToDelete.length > 0) {
        for (const imageId of imagesToDelete) {
          await deleteImage(imageId);
        }
      }

      // 3. Subir nuevas imágenes
      if (newImages.length > 0) {
        setUploadingImages(true);
        const catalog = await getOrCreateCatalogForPackage(packageResult.id);
        for (const file of newImages) {
          await uploadImage(catalog.id, file);
        }
        setUploadingImages(false);
      }

      // 4. Limpiar persistencia y redirigir
      clearPersistedData();
      router.push('/packages');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el paquete');
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER POR PASOS ============

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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título *
              </label>
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
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                Descripción corta
              </label>
              <textarea
                id="shortDescription"
                rows={3}
                value={persistedData.shortDescription}
                onChange={e => handleFieldChange('shortDescription', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Fecha de inicio (opcional)
                </label>
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
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  Fecha de fin (opcional)
                </label>
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
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                Orden
              </label>
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
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Activo
              </label>
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

            {loadingFeatureCatalog ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-8 justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
                Cargando catálogo de características...
              </div>
            ) : (
              <>
                {persistedData.features.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No hay características agregadas. Haz clic en "Añadir" para comenzar.
                  </p>
                )}

                <AnimatePresence>
                  {persistedData.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-4 items-start border-b border-gray-100 pb-4"
                    >
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Característica</label>
                        <FeatureCatalogSelector
                          catalog={featureCatalog}
                          value={feature.catalog_id || null}
                          onChange={(catalogId) => updateFeatureCatalog(index, catalogId)}
                          onCatalogCreated={handleFeatureCatalogCreated}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
                        <input
                          type="text"
                          value={feature.feature_value}
                          onChange={e => updateFeatureValue(index, e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: 100 personas"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700 p-1 mt-6"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes del paquete
              </label>

              {/* Imágenes existentes (solo en edición) */}
              {isEditing && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Imágenes actuales</h4>
                  {loadingImages ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
                      Cargando imágenes...
                    </div>
                  ) : existingImages.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay imágenes registradas</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {existingImages.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                        >
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => markImageForDeletion(img.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                            ID: {img.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subida de nuevas imágenes */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isEditing ? 'Agregar nuevas imágenes' : 'Seleccionar imágenes'}
                </h4>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="mr-2 h-4 w-4" />
                    {isEditing ? 'Agregar imágenes' : 'Seleccionar imágenes'}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                  <span className="text-sm text-gray-500">{newImages.length} archivos seleccionados</span>
                </div>

                {uploadingImages && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                    Subiendo imágenes...
                  </div>
                )}

                {/* Previsualización de nuevas imágenes */}
                {newImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {newImagePreviews.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    updateData({ [field]: value });
  };

  // ============ RENDER PRINCIPAL ============

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        {initialData ? 'Editar paquete' : 'Nuevo paquete'}
        {isRestored && (
          <span className="ml-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            ✦ Datos recuperados
          </span>
        )}
      </h2>

      <MilestoneProgressBar currentStep={step} steps={stepLabels} />

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm"
          >
            {error}
          </motion.p>
        )}

        {/* Navegación entre pasos */}
        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            onClick={prevStep}
            className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${step === 1 ? 'invisible' : ''
              }`}
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
                {loading || uploadingImages ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear paquete'}
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