"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PromotionsModal from "../features/package/PromotionsModal";
import { Package } from "@/src/types/package";
import { getValidPromotions } from "../../lib/promotions";

interface Props {
  /** Paquetes con fecha de disponibilidad establecida (ver app/layout.tsx). */
  packages: Package[];
}

const PromotionsButton: React.FC<Props> = ({ packages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const validPromotions = getValidPromotions(packages);

  if (validPromotions.length === 0) return null;

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 flex items-center">
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ver promociones"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex flex-col items-center gap-1.5 justify-center w-7 sm:w-8 py-4 sm:py-5 shrink-0 rounded-l-lg bg-linear-to-b from-secondary to-secondary/85 backdrop-blur-md shadow-xl ring-1 ring-white/20 text-white"
        >
          {/* Anillo pulsante ("ping") para llamar la atención hacia el botón */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-l-lg bg-secondary"
            animate={{ opacity: [0.55, 0], scale: [1, 1.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />

          <motion.span
            aria-hidden
            animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.span>

          <span className="relative z-10 whitespace-nowrap text-[10px] sm:text-xs font-semibold tracking-wide uppercase [writing-mode:vertical-rl] rotate-180">
            Ver promociones
          </span>
        </motion.button>
      </div>

      <PromotionsModal packages={validPromotions} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default PromotionsButton;
