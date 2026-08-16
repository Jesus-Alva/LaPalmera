// app/(dashboard)/gallery/categories/[id]/edit/page.tsx
import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getCategory } from '@/lib/api/gallery';
import CategoryForm from '@/components/forms/Gallery/CategoryForm';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const category = await getCategory(Number(id), token);

  return <CategoryForm initialData={category} />;
}