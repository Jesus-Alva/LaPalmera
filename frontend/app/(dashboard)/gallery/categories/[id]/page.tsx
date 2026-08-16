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

  const category = await getGalleryCategory(Number(id), token);

  return <GalleryImageManager category={category} />;
}