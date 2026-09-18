import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getLocations } from '@/lib/api/locations';
import LocationsTable from '@/components/forms/Locations/LocationsTable';

export default async function LocationsPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const locations = await getLocations({ limit: 50 }, token);

  return <LocationsTable initialLocations={locations} />;
}