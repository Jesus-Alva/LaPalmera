import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import PackageForm from '@/components/forms/Packages/PackageForm';

export default async function NewPackagePage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  return <PackageForm />;
}
