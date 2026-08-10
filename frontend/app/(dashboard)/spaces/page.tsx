import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth';
import { getSpaces } from '@/lib/api/spaces';
import SpacesTable from '@/components/forms/SpaceForms/SpacesTable';

export default async function SpacesPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const spaces = await getSpaces({ limit: 50 }, token);

  return (
    <div className="p-6">
      <SpacesTable initialSpaces={spaces} />
    </div>
  );
}