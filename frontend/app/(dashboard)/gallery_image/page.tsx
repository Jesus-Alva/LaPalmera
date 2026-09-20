import { getServerToken } from '@/app/lib/auth-server';
import { redirect } from 'next/navigation';
import GalleryPageClient from '@/components/features/gallery/GalleryPageClient';

export default async function GalleryPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  return <GalleryPageClient token={token} />;
}
