import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getSiteSettings } from '@/lib/api/siteSettings';
import SettingsForm from '@/components/forms/Settings/SettingsForm';

export default async function SettingsPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  let settings;
  try {
    settings = await getSiteSettings(token);
  } catch {
    // Solo un admin puede ver este módulo; cualquier otro rol es rechazado por el backend (403).
    redirect('/dashboard');
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          ⚙️ Configuración del sitio
        </h1>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
