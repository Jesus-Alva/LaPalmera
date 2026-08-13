'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TeamMember, TeamMemberCreate } from '@/src/types/teamMember';
import { createTeamMember, updateTeamMember, uploadTeamMemberPhoto } from '@/lib/api/teamMembers';
import { Upload, X, User } from 'lucide-react';
import Image from 'next/image';

interface Props {
  initialData?: TeamMember;
}

export default function TeamMemberForm({ initialData }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [photoPath, setPhotoPath] = useState(initialData?.photo_path || '');
  const [photoAlt, setPhotoAlt] = useState(initialData?.photo_alt || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photo_path || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no permitido. Use JPG, PNG, WEBP o GIF.');
      return;
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  // Eliminar imagen seleccionada
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(initialData?.photo_path || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Subir imagen al backend
  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadTeamMemberPhoto(formData);
    return result.photo_path;
  };

  // Submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let finalPhotoPath = photoPath;

      // Si hay una imagen nueva seleccionada, subirla primero
      if (selectedFile) {
        setUploadingPhoto(true);
        finalPhotoPath = await uploadPhoto(selectedFile);
        setUploadingPhoto(false);
      }

      const data: TeamMemberCreate = {
        name,
        role,
        photo_path: finalPhotoPath || undefined,
        photo_alt: photoAlt || undefined,
        sort_order: sortOrder,
        is_active: isActive,
      };

      if (initialData) {
        await updateTeamMember(initialData.id, data);
      } else {
        await createTeamMember(data);
      }

      router.push('/team-members');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el miembro del equipo');
      setUploadingPhoto(false);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar URL de previsualización al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Editar miembro del equipo' : 'Nuevo miembro del equipo'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rol *
            </label>
            <input
              id="role"
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="photo_alt" className="block text-sm font-medium text-gray-700">
            Texto alternativo (alt)
          </label>
          <input
            id="photo_alt"
            type="text"
            value={photoAlt}
            onChange={(e) => setPhotoAlt(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descripción de la imagen para accesibilidad"
          />
        </div>

        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">
            Orden
          </label>
          <input
            id="sort_order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Subida de imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto del miembro
          </label>

          <div className="flex items-start gap-6">
            {/* Previsualización */}
            <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={photoAlt || 'Vista previa'}
                  fill
                  className="object-cover"
                  unoptimized={previewUrl.startsWith('blob:')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={48} />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Upload size={18} className="mr-2" />
                  {previewUrl ? 'Cambiar foto' : 'Seleccionar foto'}
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                  >
                    <X size={18} className="mr-2" />
                    Eliminar
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />

              <p className="text-xs text-gray-500">
                Formatos: JPG, PNG, WEBP, GIF (máx 5MB)
              </p>

              {uploadingPhoto && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  Subiendo imagen...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activo */}
        <div className="flex items-center">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Activo
          </label>
        </div>

        {/* Errores */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm"
          >
            {error}
          </motion.p>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/team-members')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading || uploadingPhoto ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Guardando...
              </span>
            ) : (
              initialData ? 'Actualizar' : 'Crear miembro'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}