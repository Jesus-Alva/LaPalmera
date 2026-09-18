// components/packages/PackageGrid.tsx
'use client';

import { useState } from 'react';
import { Package } from '@/src/types/package';
import PackageCard from '@/components/forms/Packages/PackageCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  packages: Package[];
  onPackageDelete?: (id: number) => void;
}

export default function PackageGrid({ packages, onPackageDelete }: Props) {
  const [items, setItems] = useState(packages);

  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(pkg => pkg.id !== id));
    if (onPackageDelete) onPackageDelete(id);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
        <p className="text-gray-500 text-lg">Aún no hay paquetes creados.</p>
        <a
          href="/packages/new"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          Crear el primer paquete →
        </a>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((pkg) => (
            <PackageCard
              key={pkg.id}
              packageItem={pkg}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}