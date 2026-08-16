import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getCelebrations } from '@/lib/api/celebrations';
import PackageForm from '@/components/forms/Packages/PackageForm';

export default async function NewPackagePage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const celebrations = await getCelebrations({ limit: 100 }, token);

  return <PackageForm celebrations={celebrations} />;
}