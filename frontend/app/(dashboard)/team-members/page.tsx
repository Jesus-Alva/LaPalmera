import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getTeamMembers } from '@/lib/api/teamMembers';
import TeamMemberGrid from '@/components/forms/TeamMembers/TeamMemberGrid';

export default async function TeamMembersPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const items = await getTeamMembers({ limit: 50 }, token);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🧑‍🤝‍🧑 Equipo
          <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {items.length}
          </span>
        </h1>
        <a
          href="/team-members/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="mr-1">+</span> Nuevo miembro
        </a>
      </div>

      <TeamMemberGrid initialTeamMembers={items} />
    </div>
  );
}
