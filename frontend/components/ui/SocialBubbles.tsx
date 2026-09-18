"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { buildSocialLinks } from "../../lib/constants/social";
import { SocialNetworks } from "@/src/types/siteSettings";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

interface SocialBubblesProps {
  /** Enlaces reales tomados de site_settings.social_networks (ver app/layout.tsx). */
  socialNetworks?: Partial<SocialNetworks>;
}

const SocialBubbles: React.FC<SocialBubblesProps> = ({ socialNetworks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const socialLinks = useMemo(() => buildSocialLinks(socialNetworks), [socialNetworks]);

  return (
    <div
      className="fixed inset-y-0 left-0 z-40 flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Pestaña: siempre visible, alterna el panel con hover (desktop) o click (móvil) */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Ocultar redes sociales" : "Mostrar redes sociales"}
        animate={isOpen ? { scale: 1 } : { scale: [1, 1.06, 1] }}
        transition={{ duration: 1.8, repeat: isOpen ? 0 : Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 flex items-center justify-center w-6 sm:w-7 py-4 sm:py-5 shrink-0 rounded-r-lg bg-black/30 backdrop-blur-md shadow-xl ring-1 ring-white/10 text-white"
      >
        {/* Anillo pulsante ("ping"), pausado mientras el panel está abierto */}
        {!isOpen && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-r-lg bg-white/40"
            animate={{ opacity: [0.45, 0], scale: [1, 1.35] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className="relative z-10 whitespace-nowrap text-[10px] sm:text-xs font-semibold tracking-wide uppercase [writing-mode:vertical-rl] rotate-180">
          Ver redes sociales
        </span>
      </motion.button>

      {/* Panel de burbujas: colapsa su ancho a 0 (oculto) o se expande para mostrarse */}
      <div className={`overflow-hidden transition-[width] duration-300 ease-in-out ${isOpen ? "w-14 sm:w-16" : "w-0"}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          className="flex w-14 sm:w-16 flex-col gap-2 p-1.5 sm:p-2"
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.key}
              variants={bubbleVariants}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-gray-600 shadow-md ring-1 ring-black/5 transition-shadow duration-300"
            >
              {/* Resplandor de marca al hacer hover */}
              <span
                className="absolute -inset-1 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
                style={{ backgroundColor: social.hoverColor }}
              />

              {/* Flotación continua + relleno de marca */}
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 2.6 + index * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
                className="relative flex items-center justify-center w-full h-full rounded-full overflow-hidden"
              >
                <span className={`absolute inset-0 rounded-full opacity-0 scale-75 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 ${social.bgClass}`} />
                <social.Icon className="relative z-10 text-lg sm:text-xl transition-colors duration-300 group-hover:text-white" />
              </motion.span>

              {/* Tooltip con el nombre de la red social */}
              <span className="pointer-events-none absolute left-full ml-3 flex items-center whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg -translate-x-2 scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100">
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                {social.label}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SocialBubbles;
