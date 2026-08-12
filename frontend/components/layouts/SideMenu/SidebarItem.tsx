'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SidebarItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isCollapsed?: boolean;
}

export default function SidebarItem({ href, icon, label, isCollapsed = false }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className="relative block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
          ${isActive 
            ? 'bg-blue-50 text-blue-700 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
          ${isCollapsed ? 'justify-center px-2' : ''}
        `}
      >
        {/* Indicador de actividad */}
        {isActive && (
          <motion.div
            layoutId="active-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        {/* Icono */}
        <span className="text-xl flex-shrink-0">{icon}</span>

        {/* Etiqueta (se oculta si colapsado) */}
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="font-medium text-sm whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
}