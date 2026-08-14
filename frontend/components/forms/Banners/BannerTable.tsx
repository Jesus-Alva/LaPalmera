'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Banner } from '@/src/types/banners';
import { deleteBanner } from '@/lib/api/banners';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef, ActionDef } from '@/src/types/table';

interface Props {
  initialBanners: Banner[];
}

export default function BannersTable({ initialBanners }: Props) {
  const router = useRouter();

  const handleDelete = async (banner: Banner) => {
    await deleteBanner(banner.id);
    router.refresh();
  };

  const columns: ColumnDef<Banner>[] = [
    {
      key: 'image_url',
      label: 'Imagen',
      render: (banner) =>
        banner.image_url ? (
          <div className="relative w-20 h-20 rounded-md overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${banner.image_url}`}
              alt={banner.title}
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
      key: 'subtitle',
      label: 'Subtítulo',
      render: (banner) => (
        <span className="text-gray-600 block max-w-xs truncate" title={banner.subtitle || ''}>
          {banner.subtitle}
        </span>
      ),
      align: 'left',
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (banner) => (
        <span className="text-gray-600 block max-w-xs truncate" title={banner.description || ''}>
          {banner.description}
        </span>
      ),
      align: 'left',
    },
  ];

  const actions: ActionDef<Banner>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (banner) => router.push(`/banners/${banner.id}/edit`),
      icon: <span>✏️</span>,
    },
  ];

  return (
    <DataTable
      data={initialBanners}
      columns={columns}
      onDelete={handleDelete}
      resourceName="banner"
      newItemLink="/banners/new"
      emptyMessage="No hay banners creados todavía."
      actions={actions}
    />
  );
}