import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getLocation } from '@/lib/api/locations';
import LocationForm from '@/components/forms/Locations/LocationForm';

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const location = await getLocation(Number(id), token);

  return <LocationForm initialData={location} />;
}