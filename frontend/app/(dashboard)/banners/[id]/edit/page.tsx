import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getBanner } from '@/lib/api/banners';
import BannerForm from '@/components/forms/Banners/BannerForm';

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const banner = await getBanner(Number(id), token);

  return <BannerForm initialData={banner} />;
}