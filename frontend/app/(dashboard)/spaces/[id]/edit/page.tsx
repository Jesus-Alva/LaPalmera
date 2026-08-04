import { getSpace } from '@/lib/api/spaces';
import SpaceForm from '@/components/forms/SpaceForm';

export default async function EditSpacePage({ params }: { params: { id: string } }) {
  const space = await getSpace(Number(params.id));
  return <SpaceForm initialData={space} />;
}