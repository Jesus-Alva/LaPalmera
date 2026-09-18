'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCircle, LogOut, Settings, ChevronUp, Pencil, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/src/types/user';
import { getMyProfile } from '@/lib/api/users';
import { logoutUser } from '@/lib/api/auth';
import EditProfileModal from '@/components/forms/Users/EditProfileModal';

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
  const [isOpen, setIsOpen] = useState(false);
  const [displayNameOverride, setDisplayNameOverride] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleOpenEditProfile = async () => {
    setIsOpen(false);
    setLoadingProfile(true);
    try {
      const profile = await getMyProfile();
      setProfileData(profile);
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative border-t border-gray-200 p-4 shrink-0">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center gap-3 rounded-xl px-1 py-1 hover:bg-gray-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
          <UserCircle size={isCollapsed ? 32 : 36} className="text-gray-400 shrink-0" />
          {user.role && (
            <span className={`absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white ${isCollapsed ? 'w-2.5 h-2.5' : ''}`} />
          )}
        </motion.div>
        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-700 truncate">
                {displayNameOverride || user.display_name || user.email}
              </p>
              {user.role && (
                <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
              )}
            </div>
            <ChevronUp
              size={16}
              className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? '' : 'rotate-180'}`}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10 ${
              isCollapsed ? 'left-full ml-2 w-48' : 'left-4 right-4'
            }`}
          >
            <button
              onClick={handleOpenEditProfile}
              disabled={loadingProfile}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              {loadingProfile ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
              Editar perfil
            </button>
            {user.role === 'admin' && (
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={16} />
                Configuración
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {profileData && (
        <EditProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={profileData}
          onSuccess={(updated) => {
            setDisplayNameOverride(updated.display_name);
            setProfileData(updated);
          }}
        />
      )}
    </div>
  );
}
