// components/forms/SpaceForms/SpacesTable.tsx
'use client';

import { Space } from '@/src/types/space';
import { deleteSpace } from '@/lib/api/spaces';
import { DataTable, ColumnDef, ActionDef } from '@/components/ui/DataTable';
import Link from 'next/link';
import Image from 'next/image';

interface SpacesTableProps {
  initialSpaces: Space[];
  onRefresh?: () => void;
}

export default function SpacesTable({ initialSpaces, onRefresh }: SpacesTableProps) {
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
      className: 'w-24',
    },
    {
      key: 'title',
      label: 'Título',
      render: (space) => <span className="font-medium text-gray-800">{space.title}</span>,
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (space) => (
        <span className="text-gray-600 block max-w-xs truncate" title={space.description || ''}>
          {space.description || '—'}
        </span>
      ),
      hideOnMobile: true,
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
          <span
            className={`w-2 h-2 rounded-full mr-1.5 ${
              space.is_active ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          {space.is_active ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  const actions: ActionDef<Space>[] = [
    {
      label: 'Editar',
      onClick: (space) => {
        // Usar router.push o Link
        window.location.href = `/spaces/${space.id}/edit`;
      },
      className: 'text-blue-600 hover:text-blue-800',
      icon: <span>Editar</span>,
    },
  ];

  return (
    <DataTable
      data={initialSpaces}
      columns={columns}
      actions={actions}
      onDelete={deleteSpace}
      title="📋 Espacios"
      createLink="/spaces/new"
      createLabel="Nuevo"
      emptyMessage="No hay espacios creados todavía."
      onRefresh={onRefresh}
    />
  );
}