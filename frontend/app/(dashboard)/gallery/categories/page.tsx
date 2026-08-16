import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getGalleryCategories } from '@/lib/api/gallery';
import GalleryCategoriesGrid from '@/components/forms/Gallery/GalleryCategoriesGrid';

export default async function GalleryPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');
  const categories = await getGalleryCategories({ limit: 50 }, token);
  return <GalleryCategoriesGrid categories={categories} />;
}