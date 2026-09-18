// new/page.tsx
import { getServerToken } from '@/app/lib/auth-server';
import BannerForm from '@/components/forms/Banners/BannerForm';
import { redirect } from 'next/navigation';

export default async function NewBannerPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');
  return <BannerForm />;
}