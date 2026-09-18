"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const DISPLAY_DURATION = 1900; // ms visible antes de desvanecerse

const emptySubscribe = () => () => {};

const LoadingScreen: React.FC = () => {
  // Devuelve `false` en el server y en el primer render del cliente (antes de
  // hidratar) y `true` una vez hidratado, sin disparar un setState manual en
  // un efecto: evita el mismatch de SSR que provoca Framer Motion.
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!hasMounted) return;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setIsVisible(false), DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, [hasMounted]);

  useEffect(() => {
    if (hasMounted && !isVisible) {
      document.body.style.overflow = "unset";
    }
  }, [hasMounted, isVisible]);

  if (!hasMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-secondary"
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.25 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64"
          >
            <Image
              src="/images/identidad/La_palmera_sello-removebg-preview.png"
              alt="La Palmera - Jardín de Eventos"
              fill
              className="object-contain drop-shadow-[0_0_25px_rgba(253,206,118,0.35)]"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 flex items-center gap-1.5 text-primary font-noto-serif uppercase tracking-[0.3em] text-xs sm:text-sm"
          >
            <span>Cargando</span>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                />
              ))}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
