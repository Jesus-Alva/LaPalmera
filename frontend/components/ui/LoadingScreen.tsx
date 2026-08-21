"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const DISPLAY_DURATION = 1900; // ms visible antes de desvanecerse

const LoadingScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setIsVisible(false), DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      document.body.style.overflow = "unset";
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
