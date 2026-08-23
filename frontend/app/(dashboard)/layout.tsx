import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import { decodeJwtPayload } from '@/lib/jwt';
import Sidebar from '@/components/layouts/SideMenu/Sidebar';

// Función que decodifica el token para obtener los datos del usuario (solo email y rol)
async function getUserFromToken() {
  const token = await getServerToken();
  if (!token) return undefined;

  const payload = decodeJwtPayload<{ sub?: string; display_name?: string; role?: string }>(token);
  if (!payload) return undefined;

  return {
    email: payload.sub || 'usuario',
    display_name: payload.display_name || payload.sub,
    role: payload.role || 'read',
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const user = await getUserFromToken();
  // Todo usuario recién registrado inicia con rol de solo lectura y no debe
  // acceder al panel de administración, únicamente al sitio público.
  if (user?.role === 'read') redirect('/');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto lg:ml-64 transition-all duration-300">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}