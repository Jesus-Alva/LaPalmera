// app/(dashboard)/gallery/categories/new/page.tsx
import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import GalleryCategoryForm from '@/components/forms/Gallery/CategoryForm';

export default async function NewCategoryPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  return <GalleryCategoryForm />;
}