import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getUsers } from '@/lib/api/users';
import UsersTable from '@/components/forms/Users/UsersTable';
import { decodeJwtPayload } from '@/lib/jwt';

export default async function UsersPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');
  const currentUserEmail = decodeJwtPayload<{ sub?: string }>(token)?.sub;

  let users;
  try {
    users = await getUsers({ limit: 100 }, token);
  } catch {
    // Solo un admin puede ver este módulo; cualquier otro rol es rechazado por el backend (403).
    redirect('/dashboard');
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          👤 Usuarios
          <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {users.length}
          </span>
        </h1>
      </div>

      <UsersTable initialUsers={users} currentUserEmail={currentUserEmail} />
    </div>
  );
}
