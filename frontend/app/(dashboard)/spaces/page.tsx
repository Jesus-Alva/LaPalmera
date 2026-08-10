import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth';
import { getSpaces } from '@/lib/api/spaces';
import Link from 'next/link';
import SpacesTable from '@/components/forms/SpaceForms/SpacesTable';

export default async function SpacesPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const spaces = await getSpaces({ limit: 50 }, token);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Espacios</h1>
        <Link
          href="/spaces/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo espacio
        </Link>
      </div>

      <SpacesTable initialSpaces={spaces} />
    </div>
  );
}