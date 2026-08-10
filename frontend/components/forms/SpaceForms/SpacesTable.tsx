// components/forms/SpaceForms/SpacesTable.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Space } from '@/src/types/space';
import { deleteSpace } from '@/lib/api/spaces';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef, ActionDef } from '@/types/table';

interface Props {
  initialSpaces: Space[];
}

export default function SpacesTable({ initialSpaces }: Props) {
  const router = useRouter();

  const handleDelete = async (space: Space) => {
    await deleteSpace(space.id);
    router.refresh();
  };

  const columns: ColumnDef<Space>[] = [
    {
      key: 'image_url',
      label: 'Imagen',
      render: (space) =>
        space.image_url ? (
          <div className="relative w-20 h-20 rounded-md overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${space.image_url}`}
              alt={space.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
            Sin img
          </div>
        ),
      align: 'center',
    },
    {
      key: 'title',
      label: 'Título',
      align: 'left',
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (space) => (
        <span className="text-gray-600 block max-w-xs truncate" title={space.description || ''}>
          {space.description || '—'}
        </span>
      ),
      align: 'left',
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (space) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            space.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-1.5 ${space.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          {space.is_active ? 'Activo' : 'Inactivo'}
        </span>
      ),
      align: 'center',
    },
  ];

  // Acciones (editar ya está como link interno en el DataTable? Podemos agregarlo como acción)
  // En DataTable, las acciones se pueden personalizar. Pero podemos usar el enlace de edición directamente.
  // También podemos dejar que DataTable renderice las acciones predeterminadas (editar y eliminar)
  // Si queremos un enlace "Editar", podemos agregarlo como acción adicional.

  const actions: ActionDef<Space>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (space) => router.push(`/spaces/${space.id}/edit`),
      icon: <span>✏️</span>,
    },
  ];

  return (
    <DataTable
      data={initialSpaces}
      columns={columns}
      onDelete={handleDelete}
      resourceName="espacio"
      newItemLink="/spaces/new"
      emptyMessage="No hay espacios creados todavía."
      actions={actions}
    />
  );
}