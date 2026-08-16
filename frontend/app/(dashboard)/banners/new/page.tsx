// new/page.tsx
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import BannerForm from '@/components/forms/Banners/BannerForm';
import { redirect } from 'next/dist/client/components/navigation';

export default async function NewBannerPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');
  return <BannerForm token={token} />;
}