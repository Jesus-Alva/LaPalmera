// app/(dashboard)/packages/page.tsx
import { redirect } from 'next/navigation';
import { getServerToken } from '@/app/lib/auth-server';
import { getPackages } from '@/lib/api/packages';
import PackageGrid from '@/components/forms/Packages/PackageGrid';

export default async function PackagesPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const packages = await getPackages(token, { limit: 100 });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📦 Paquetes
          <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {packages.length}
          </span>
        </h1>
        <a
          href="/packages/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="mr-1">+</span> Nuevo paquete
        </a>
      </div>

      <PackageGrid packages={packages} />
    </div>
  );
}