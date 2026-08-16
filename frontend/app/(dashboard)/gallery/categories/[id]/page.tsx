// app/(dashboard)/gallery/categories/[id]/page.tsx
import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getCategory } from '@/lib/api/gallery';
import CategoryDetail from '@/components/forms/Gallery/CategoryDetail';

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const category = await getCategory(Number(id), token);

  return <CategoryDetail category={category} />;
}