// components/forms/TeamMembers/TeamMemberCard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TeamMember } from '@/src/types/teamMember';
import { deleteTeamMember } from '@/lib/api/teamMembers';
import { Edit, Trash2, CheckCircle, XCircle, User } from 'lucide-react';
import { confirmAction, showErrorAlert } from '@/lib/alerts';

interface Props {
  member: TeamMember;
  onDelete?: (id: number) => void;
}

export default function TeamMemberCard({ member, onDelete }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const handleEdit = () => {
    router.push(`/team-members/${member.id}/edit`);
  };

  const handleDelete = async () => {
    if (!(await confirmAction({ text: `¿Eliminar a "${member.name}" del equipo?` }))) return;
    setIsDeleting(true);
    try {
      await deleteTeamMember(member.id);
      if (onDelete) onDelete(member.id);
      router.refresh();
    } catch (error) {
      showErrorAlert('Error al eliminar el miembro del equipo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Estado */}
      <div className="relative pt-5 flex justify-center">
        <div className="absolute top-3 right-3">
          {member.is_active ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              Inactivo
            </span>
          )}
        </div>

        {/* Foto */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
          {member.photo_path ? (
            <Image
              src={`${baseUrl}${member.photo_path}`}
              alt={member.photo_alt || member.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User className="w-10 h-10" />
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col grow text-center">
        <h3 className="font-noto-serif font-semibold text-xl text-gray-800 line-clamp-1">
          {member.name}
        </h3>

        <p className="text-gray-500 text-sm mt-1 line-clamp-1 grow">
          {member.role}
        </p>

        {member.sort_order !== null && (
          <p className="text-xs text-gray-400 mt-2">
            Orden: {member.sort_order}
          </p>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-1" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
