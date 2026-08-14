// components/PackagesTable.tsx
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package } from '@/src/types/package';
import { deletePackage } from '@/lib/api/packages';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef, ActionDef } from '@/src/types/table';

interface Props {
  initialPackages: Package[];
}

export default function PackagesTable({ initialPackages }: Props) {
  const router = useRouter();

  const handleDelete = async (pkg: Package) => {
    await deletePackage(pkg.id);
    router.refresh();
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-MX');
  };

  const columns: ColumnDef<Package>[] = [
    {
      key: 'image_url',
      label: 'Imagen',
      render: (pkg) =>
        pkg.image_url ? (
          <div className="relative w-20 h-20 rounded-md overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${pkg.image_url}`}
              alt={pkg.title}
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
      key: 'celebration_title',
      label: 'Celebración',
      render: (pkg) => pkg.celebration_title || '—',
      align: 'left',
    },
    {
      key: 'date_range',
      label: 'Vigencia',
      render: (pkg) => {
        if (!pkg.data_available_start && !pkg.data_available_end) return 'Permanente';
        const start = formatDate(pkg.data_available_start);
        const end = formatDate(pkg.data_available_end);
        return `${start} → ${end}`;
      },
      align: 'center',
    },
    {
      key: 'is_available',
      label: 'Disponible',
      render: (pkg) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          pkg.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {pkg.is_available ? 'Disponible' : 'No disponible'}
        </span>
      ),
      align: 'center',
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (pkg) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {pkg.is_active ? 'Activo' : 'Inactivo'}
        </span>
      ),
      align: 'center',
    },
  ];

  const actions: ActionDef<Package>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (pkg) => router.push(`/packages/${pkg.id}/edit`),
      icon: <span>✏️</span>,
    },
  ];

  return (
    <DataTable
      data={initialPackages}
      columns={columns}
      onDelete={handleDelete}
      resourceName="paquete"
      newItemLink="/packages/new"
      emptyMessage="No hay paquetes creados todavía."
      actions={actions}
    />
  );
}