// components/LocationsTable.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Location } from '@/src/types/location';
import { deleteLocation } from '@/lib/api/locations';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef, ActionDef } from '@/src/types/table';

interface Props {
  initialLocations: Location[];
}

export default function LocationsTable({ initialLocations }: Props) {
  const router = useRouter();

  const handleDelete = async (location: Location) => {
    await deleteLocation(location.id);
    router.refresh();
  };

  const columns: ColumnDef<Location>[] = [
    {
      key: 'name',
      label: 'Nombre',
      align: 'left',
    },
    {
      key: 'address',
      label: 'Dirección',
      render: (loc) => (
        <span className="text-gray-600">
          {loc.address_line1}{loc.address_line2 ? `, ${loc.address_line2}` : ''}
        </span>
      ),
      align: 'left',
    },
    {
      key: 'city',
      label: 'Ciudad',
      align: 'left',
    },
    {
      key: 'state',
      label: 'Estado',
      align: 'left',
    },
    {
      key: 'country',
      label: 'País',
      align: 'left',
    },
    {
      key: 'is_primary',
      label: 'Principal',
      render: (loc) => (
        <span className={loc.is_primary ? 'text-green-600 font-semibold' : 'text-gray-400'}>
          {loc.is_primary ? '⭐' : '•'}
        </span>
      ),
      align: 'center',
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (loc) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          loc.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${loc.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          {loc.is_active ? 'Activo' : 'Inactivo'}
        </span>
      ),
      align: 'center',
    },
  ];

  const actions: ActionDef<Location>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (loc) => router.push(`/locations/${loc.id}/edit`),
      icon: <span>✏️</span>,
    },
  ];

  return (
    <DataTable
      data={initialLocations}
      columns={columns}
      onDelete={handleDelete}
      resourceName="ubicación"
      newItemLink="/locations/new"
      emptyMessage="Aún no hay ubicación registrada."
      actions={actions}
    />
  );
}