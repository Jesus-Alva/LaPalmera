'use client';

import { useRouter } from 'next/navigation';
import { Celebration } from '@/src/types/celebration';
import { deleteCelebration } from '@/lib/api/celebrations';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef, ActionDef } from '@/src/types/table';

interface Props {
  initialCelebrations: Celebration[];
}

export default function CelebrationsTable({ initialCelebrations }: Props) {
  const router = useRouter();

  const handleDelete = async (celebration: Celebration) => {
    await deleteCelebration(celebration.id);
    router.refresh();
  };

  const columns: ColumnDef<Celebration>[] = [
    {
      key: 'title',
      label: 'Título',
      align: 'left',
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (celebration) => (
        <span className="text-gray-600 block max-w-xs truncate" title={celebration.description || ''}>
          {celebration.description || '—'}
        </span>
      ),
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
      render: (celebration) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            celebration.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-1.5 ${celebration.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          {celebration.is_active ? 'Activo' : 'Inactivo'}
        </span>
      ),
      align: 'center',
    },
  ];

  const actions: ActionDef<Celebration>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (celebration) => router.push(`/celebrations/${celebration.id}/edit`),
      icon: <span>✏️</span>,
    },
  ];

  return (
    <DataTable
      data={initialCelebrations}
      columns={columns}
      onDelete={handleDelete}
      resourceName="celebración"
      newItemLink="/celebrations/new"
      emptyMessage="No hay celebraciones creadas todavía."
      actions={actions}
    />
  );
}