'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  Calendar, 
  MapPin, 
  Users, 
  Image, 
  HelpCircle, 
  Package, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import SidebarUser from './SidebarUser';

interface SidebarProps {
  user?: {
    display_name?: string;
    email: string;
    role?: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Cerrar el menú móvil al redimensionar a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { href: '/spaces', icon: <LayoutGrid size={22} />, label: 'Espacios' },
    { href: '/celebrations', icon: <Calendar size={22} />, label: 'Celebraciones' },
    { href: '/locations', icon: <MapPin size={22} />, label: 'Ubicaciones' },
    { href: '/team-members', icon: <Users size={22} />, label: 'Equipo' },
    { href: '/banners', icon: <Image size={22} />, label: 'Banners' },
    { href: '/faqs', icon: <HelpCircle size={22} />, label: 'FAQs' },
    { href: '/packages', icon: <Package size={22} />, label: 'Paquetes' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  // Sidebar width dinámico
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  // Contenido del sidebar (compartido entre desktop y móvil)
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold text-gray-800"
          >
            La Palmera
          </motion.span>
        ) : (
          <span className="text-lg font-bold text-gray-800">LP</span>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <button
          onClick={toggleMobile}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Usuario y Logout */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        {user && <SidebarUser user={user} isCollapsed={isCollapsed} />}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón para abrir el menú en móvil */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      {/* Overlay para móvil */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobile}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar para escritorio */}
      <motion.aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          ${sidebarWidth} hidden lg:block
        `}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Sidebar para móvil (overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed top-0 left-0 h-full bg-white z-50
              w-64 lg:hidden shadow-2xl
            `}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}