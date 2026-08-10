import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth';
import { getCelebrations } from '@/lib/api/celebrations';
import CelebrationsTable from '@/components/forms/Celebrations/CelebrationsTable';

export default async function CelebrationsPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const celebrations = await getCelebrations({ limit: 50 }, token);

  return <CelebrationsTable initialCelebrations={celebrations} />;
}