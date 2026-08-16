import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getCelebration } from '@/lib/api/celebrations';
import CelebrationForm from '@/components/forms/Celebrations/CelebrationsForm';

export default async function EditCelebrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const celebration = await getCelebration(Number(id), token);

  return <CelebrationForm initialData={celebration} />;
}