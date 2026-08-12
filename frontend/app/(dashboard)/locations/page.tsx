import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth';
import { getLocations } from '@/lib/api/locations';
import LocationsTable from '@/components/forms/Locations/LocationsTable';

export default async function LocationsPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const locations = await getLocations({ limit: 50 }, token);

  return <LocationsTable initialLocations={locations} />;
}