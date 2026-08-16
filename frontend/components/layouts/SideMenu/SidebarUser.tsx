'use client';

import { useRouter } from 'next/navigation';
import { UserCircle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarUserProps {
  user?: {
    display_name?: string;
    email: string;
    role?: string;
  };
  isCollapsed?: boolean;
}

export default function SidebarUser({ user, isCollapsed = false }: SidebarUserProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="border-t border-gray-200 p-4 flex-shrink-0">
      {/* Información del usuario */}
      <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <UserCircle size={isCollapsed ? 32 : 36} className="text-gray-400 flex-shrink-0" />
          {user.role && (
            <span className={`absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white ${isCollapsed ? 'w-2.5 h-2.5' : ''}`} />
          )}
        </motion.div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-w-0"
          >
            <p className="text-sm font-medium text-gray-700 truncate">
              {user.display_name || user.email}
            </p>
            {user.role && (
              <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Botón de logout */}
      {/* <button
        onClick={handleLogout}
        className={`
          w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 
          transition-colors duration-200 group
          ${isCollapsed ? 'justify-center' : ''}
        `}
      >
        <LogOut size={isCollapsed ? 20 : 18} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            Cerrar sesión
          </motion.span>
        )}
      </button> */}
    </div>
  );
}