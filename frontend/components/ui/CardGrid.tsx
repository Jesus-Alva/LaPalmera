// components/ui/CardGrid.tsx
'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  items: any[];
  renderItem: (item: any) => ReactNode;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export default function CardGrid({
  items,
  renderItem,
  emptyMessage = 'No hay elementos',
  emptyAction,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
}: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  const gridCols = `grid-cols-${columns.sm} sm:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`;

  return (
    <AnimatePresence>
      <div className={`grid gap-6 ${gridCols}`}>
        {items.map((item) => renderItem(item))}
      </div>
    </AnimatePresence>
  );
}