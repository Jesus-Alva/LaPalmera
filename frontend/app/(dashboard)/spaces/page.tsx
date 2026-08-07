import { getSpaces } from '@/lib/api/spaces';
import { getServerToken } from '@/app/lib/auth';
import Link from 'next/link';

import SapecesTable from '@/components/forms/SpacesTable';

export default async function SpacesPage() {
  const token = await getServerToken();
  if (!token) {
    return <div>No autorizado</div>;
  };
  const spaces = await getSpaces({ limit: 50 }, token);

  return (
    <div className="p-6">
      <SapecesTable initialSpaces={spaces} />
    </div>
  );
}