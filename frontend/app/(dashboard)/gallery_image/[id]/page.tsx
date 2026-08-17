import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getGalleryCategory } from '@/lib/api/gallery';
import GalleryImageManager from '@/components/forms/Gallery/GalleryImageManager';

export default async function GalleryCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const categoryId = Number(id);
  if (isNaN(categoryId)) {
    throw new Error('ID inválido');
  }

  const category = await getGalleryCategory(categoryId, token);

  return <GalleryImageManager category={category} />;
}