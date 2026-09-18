// components/forms/TeamMembers/TeamMemberGrid.tsx
'use client';

import { useState } from 'react';
import { TeamMember } from '@/src/types/teamMember';
import TeamMemberCard from '@/components/forms/TeamMembers/TeamMemberCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  initialTeamMembers: TeamMember[];
}

export default function TeamMemberGrid({ initialTeamMembers }: Props) {
  const [items, setItems] = useState(initialTeamMembers);

  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(member => member.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
        <p className="text-gray-500 text-lg">No hay miembros del equipo creados todavía.</p>
        <a
          href="/team-members/new"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          Crear el primer miembro →
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
          {items.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onDelete={handleDelete}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
