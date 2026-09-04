'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, BellRing, BellOff, Loader2 } from 'lucide-react';
import { User, UserRole, UserStatus } from '@/src/types/user';
import { getUsers, updateUser } from '@/lib/api/users';
import { confirmAction } from '@/lib/alerts';

interface Props {
  initialUsers: User[];
  currentUserEmail?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  read: 'Solo lectura',
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800',
  editor: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
};

const STATUS_BADGE_CLASSES: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-700',
  suspended: 'bg-red-100 text-red-800',
};

const formatLastLogin = (value: string | null) => {
  if (!value) return 'Nunca';
  return new Date(value).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function UsersTable({ initialUsers, currentUserEmail }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Evita re-consultar al montar: ya tenemos initialUsers del server component.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getUsers({ limit: 100, search: search.trim() || undefined });
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al buscar usuarios');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const handleUpdate = async (userId: number, data: { role?: UserRole; status?: UserStatus }) => {
    const user = users.find(u => u.id === userId);
    if (user && currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase()) {
      setError('No puedes modificar tu propio rol o estatus.');
      return;
    }

    if (!(await confirmAction({ text: `¿Desea actualizar este usuario al rol ${ROLE_LABELS[data.role || users.find(u => u.id === userId)?.role || 'read']}?` }))) return;
    const previous = users;
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...data } : u)));
    setSavingId(userId);
    setError('');
    try {
      await updateUser(userId, data);
    } catch (err) {
      setUsers(previous);
      setError(err instanceof Error ? err.message : 'Error al actualizar el usuario');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por correo o nombre..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificaciones</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Último acceso</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Buscando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isCurrentUser = Boolean(
                  currentUserEmail && u.email.toLowerCase() === currentUserEmail.toLowerCase()
                );

                return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{u.display_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-55 truncate" title={u.address || undefined}>{u.address || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.notifications_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.notifications_enabled ? <BellRing className="w-3 h-3 mr-1" /> : <BellOff className="w-3 h-3 mr-1" />}
                      {u.notifications_enabled ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatLastLogin(u.last_login_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ROLE_BADGE_CLASSES[u.role]}`}>
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {ROLE_LABELS[u.role]}
                      </span>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdate(u.id, { role: e.target.value as UserRole })}
                        disabled={savingId === u.id || isCurrentUser}
                        className="text-xs border border-gray-300 rounded-md px-1.5 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="admin">Administrador</option>
                        <option value="editor">Editor</option>
                        <option value="read">Solo lectura</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE_CLASSES[u.status]}`}>
                        {STATUS_LABELS[u.status]}
                      </span>
                      <select
                        value={u.status}
                        onChange={(e) => handleUpdate(u.id, { status: e.target.value as UserStatus })}
                        disabled={savingId === u.id || isCurrentUser}
                        className="text-xs border border-gray-300 rounded-md px-1.5 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="suspended">Suspendido</option>
                      </select>
                    </div>
                    {savingId === u.id && <Loader2 className="inline h-3.5 w-3.5 animate-spin ml-2 text-gray-400" />}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
