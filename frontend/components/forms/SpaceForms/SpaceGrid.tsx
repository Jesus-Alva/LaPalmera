// components/forms/SpaceForms/SpaceGrid.tsx
'use client';

import { useState } from 'react';
import { Space } from '@/src/types/space';
import SpaceCard from '@/components/forms/SpaceForms/SpaceCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  initialSpaces: Space[];
}

export default function SpaceGrid({ initialSpaces }: Props) {
  const [items, setItems] = useState(initialSpaces);

  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(space => space.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
        <p className="text-gray-500 text-lg">No hay espacios creados todavía.</p>
        <a
          href="/spaces/new"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          Crear el primer espacio →
        </a>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {items.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onDelete={handleDelete}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
