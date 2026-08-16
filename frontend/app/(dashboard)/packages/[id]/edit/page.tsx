import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getPackage } from '@/lib/api/packages';
import { getCelebrations } from '@/lib/api/celebrations';
import PackageForm from '@/components/forms/Packages/PackageForm';

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const [packageData, celebrations] = await Promise.all([
    getPackage(Number(id), token),
    getCelebrations({ limit: 100 }, token),
  ]);

  return <PackageForm initialData={packageData} celebrations={celebrations} />;
}