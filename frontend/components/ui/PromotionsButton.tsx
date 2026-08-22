"use client";

import { useState } from "react";
import PromotionsModal from "../features/package/PromotionsModal";
import { Package } from "@/src/types/package";

interface Props {
  /** Paquetes con fecha de disponibilidad establecida (ver app/layout.tsx). */
  packages: Package[];
}

const PromotionsButton: React.FC<Props> = ({ packages }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (packages.length === 0) return null;

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ver promociones"
          className="relative z-10 flex items-center justify-center w-6 sm:w-7 py-4 sm:py-5 shrink-0 rounded-l-lg bg-black/30 backdrop-blur-md shadow-xl ring-1 ring-white/10 text-white"
        >
          <span className="whitespace-nowrap text-[10px] sm:text-xs font-semibold tracking-wide uppercase [writing-mode:vertical-rl] rotate-180">
            Ver promociones
          </span>
        </button>
      </div>

      <PromotionsModal packages={packages} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default PromotionsButton;
