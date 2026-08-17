import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getGalleryCategory } from '@/lib/api/gallery';
import GalleryCategoryForm from '@/components/forms/Gallery/GalleryCategoryForm';

export default async function EditGalleryCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const category = await getGalleryCategory(Number(id), token);

  return <GalleryCategoryForm initialData={category} />;
}