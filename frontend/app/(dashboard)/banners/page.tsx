import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getBanners } from '@/lib/api/banners';
import BannersTable from '@/components/forms/Banners/BannerTable';

export default async function BannersPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const banners = await getBanners({ limit: 50 }, token);

  return <BannersTable initialBanners={banners} />;
}