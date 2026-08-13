import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth';
import { getTeamMembers } from '@/lib/api/teamMembers';
import TeamMembersTable from '@/components/forms/TeamMembers/TeamMembersTable';

export default async function TeamMembersPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const items = await getTeamMembers({ limit: 50 }, token);

  return <TeamMembersTable initialTeamMembers={items} />;
}