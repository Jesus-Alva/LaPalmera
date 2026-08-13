'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TeamMember } from '@/src/types/teamMember';
import { deleteTeamMember } from '@/lib/api/teamMembers';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef, ActionDef } from '@/src/types/table';

interface Props {
  initialTeamMembers: TeamMember[];
}

export default function TeamMembersTable({ initialTeamMembers }: Props) {
  const router = useRouter();

  const handleDelete = async (item: TeamMember) => {
    await deleteTeamMember(item.id);
    router.refresh();
  };

  const columns: ColumnDef<TeamMember>[] = [
    {
      key: 'photo_path',
      label: 'Foto',
      render: (item) =>
        item.photo_path ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${item.photo_path}`}
              alt={item.photo_alt || item.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs">
            Sin foto
          </div>
        ),
      align: 'center',
    },
    {
      key: 'name',
      label: 'Nombre',
      align: 'left',
    },
    {
      key: 'role',
      label: 'Rol',
      align: 'left',
    },
    {
      key: 'sort_order',
      label: 'Orden',
      align: 'center',
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-1.5 ${item.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          {item.is_active ? 'Activo' : 'Inactivo'}
        </span>
      ),
      align: 'center',
    },
  ];

  const actions: ActionDef<TeamMember>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (item) => router.push(`/team-members/${item.id}/edit`),
      icon: <span>✏️</span>,
    },
  ];

  return (
    <DataTable
      data={initialTeamMembers}
      columns={columns}
      onDelete={handleDelete}
      resourceName="miembro del equipo"
      newItemLink="/team-members/new"
      emptyMessage="No hay miembros del equipo creados todavía."
      actions={actions}
    />
  );
}