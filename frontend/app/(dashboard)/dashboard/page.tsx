// app/(dashboard)/dashboard/page.tsx
import { fetchProtectedData } from '@/app/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  let user;
  try {
    // ✅ Ya es async y maneja await internamente
    user = await fetchProtectedData('/users/me');
  } catch (error) {
    // Si hay error, redirigir al login
    console.error('Error al obtener perfil:', error);
    redirect('/login');
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">
        Bienvenido, {user.display_name || user.email}
      </h2>
      <p className="text-sm text-gray-600">Rol: {user.role}</p>
    </div>
  );
}