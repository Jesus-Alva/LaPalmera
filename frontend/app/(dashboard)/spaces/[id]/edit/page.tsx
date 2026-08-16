import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getSpace } from '@/lib/api/spaces';
import SpaceForm from '@/components/forms/SpaceForms/SpaceForm';
import { redirect } from 'next/navigation';

export default async function EditSpacePage({
  params,
}: {
  params: Promise<{ id: string }>; // ¡Es una promesa!
}) {
  const { id } = await params; // Obtener el ID
  const token = await getServerToken();

  if (!token) {
    // Redirige al login si no hay token (opcional)
    redirect('/login');
  }

  const space = await getSpace(Number(id), token); // Pasar token
  return <SpaceForm initialData={space} />;
}