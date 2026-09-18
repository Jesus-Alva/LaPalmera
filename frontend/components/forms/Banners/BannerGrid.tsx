// components/forms/Banners/BannerGrid.tsx
'use client';

import { useState } from 'react';
import { Banner } from '@/src/types/banners';
import BannerCard from '@/components/forms/Banners/BannerCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  initialBanners: Banner[];
}

export default function BannerGrid({ initialBanners }: Props) {
  const [items, setItems] = useState(initialBanners);

  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(banner => banner.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
        <p className="text-gray-500 text-lg">Aún no hay banners creados.</p>
        <a
          href="/banners/new"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          Crear el primer banner →
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
          {items.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onDelete={handleDelete}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
