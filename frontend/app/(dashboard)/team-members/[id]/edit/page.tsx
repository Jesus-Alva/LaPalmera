import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { getTeamMember } from '@/lib/api/teamMembers';
import TeamMemberForm from '@/components/forms/TeamMembers/TeamMembersForm';

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) redirect('/login');

  const item = await getTeamMember(Number(id), token);

  return <TeamMemberForm initialData={item} />;
}