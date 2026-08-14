import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth';
import { getPackages } from '@/lib/api/packages';
import PackagesTable from '@/components/forms/Packages/PackageTable';

export default async function PackagesPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const packages = await getPackages(token, { limit: 50 });

  return <PackagesTable initialPackages={packages} />;
}