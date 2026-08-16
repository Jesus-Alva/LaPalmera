import { redirect } from 'next/navigation';
import { getServerToken, fetchProtectedData } from '@/app/lib/auth-server';
import Sidebar from '@/components/layouts/SideMenu/Sidebar';

// Función que decodifica el token para obtener los datos del usuario (solo email y rol)
async function getUserFromToken() {
  const token = await getServerToken();
  if (!token) return undefined;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      email: payload.sub || 'usuario',
      display_name: payload.display_name || payload.sub,
      role: payload.role || 'editor',
    };
  } catch {
    return undefined;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const user = await getUserFromToken();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto lg:ml-64 transition-all duration-300">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}