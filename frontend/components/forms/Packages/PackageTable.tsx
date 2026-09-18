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

  const columns: ColumnDef<Package>[] = [
    {
      key: 'image_url',
      label: 'Imagen',
      render: (pkg) =>
        pkg.image_url ? (
          <div className="relative w-12 h-12 rounded-md overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${pkg.image_url}`}
              alt={pkg.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
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
      key: 'is_active',
      label: 'Estado',
      render: (pkg) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-1.5 ${pkg.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
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
      emptyMessage="Aún no hay paquetes creados."
      actions={actions}
    />
  );
}