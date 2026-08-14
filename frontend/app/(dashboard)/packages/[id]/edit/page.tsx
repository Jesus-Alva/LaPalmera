import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getPackage } from '@/lib/api/packages';
import PackageForm from '@/components/forms/Packages/PackageForm';

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const packageData = await getPackage(Number(id), token);

  return <PackageForm initialData={packageData} />;
}