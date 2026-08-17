import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import GalleryCategoryForm from '@/components/forms/Gallery/CategoryForm';

export default async function NewGalleryCategoryPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');
  return <GalleryCategoryForm />;
}