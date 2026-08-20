"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../lib/hooks/useTranslation";
import { useLang } from "../../lib/i18n/LanguageProvider";
import { ROUTES_PAGE } from "../../app/constants/routes";

interface ComponentProps {
  logo: string;
}

interface NavLink {
  href: string;
  labelKey: string;
  isAnchor?: boolean;
}

const menuVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

const NavbarComponent: React.FC<ComponentProps> = ({ logo }) => {
  const { t } = useTranslation();
  const { locale, setLocale } = useLang();
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Reducir la navbar al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú al cambiar a tamaño desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
        document.body.style.overflow = ""; // restaurar scroll
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloquear/desbloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Manejar hash para enlaces ancla
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.slice(1));
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navLinks: NavLink[] = [
    { href: ROUTES_PAGE.inicio, labelKey: "inicio.navbar.opt1" },
    { href: ROUTES_PAGE.paquetes, labelKey: "inicio.navbar.opt2" },
    { href: ROUTES_PAGE.galeria, labelKey: "inicio.navbar.opt3" },
    { href: ROUTES_PAGE.nosotros, labelKey: "inicio.navbar.opt4" },
    { href: ROUTES_PAGE.contacto, labelKey: "inicio.navbar.opt5" },
  ];

  const isActive = (link: NavLink): boolean => {
    if (link.isAnchor) {
      return currentHash === link.href.slice(1);
    } else {
      const normalizedPathname = pathname?.replace(/\/$/, "");
      const normalizedHref = link.href.replace(/\/$/, "");
      return normalizedPathname === normalizedHref;
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`
          fixed top-0 right-0 left-0 z-50 bg-linear-to-r from-black/80 via-black/60 to-black/40
          backdrop-blur-md border-b border-white/10 transition-all duration-300 ease-out
          ${isScrolled ? "h-14 md:h-16 shadow-lg" : "h-16 md:h-20 shadow-md"}
        `}
      >
        <div className="container mx-auto h-full px-4 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-full items-center justify-center shrink-0"
          >
            <Image
                src={logo}
                alt="Logo"
                className="h-full w-auto max-h-12 md:max-h-full transition-all duration-300"
                width={500}
                height={500}
                priority
              />
          </motion.div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-12 text-white font-noto-serif font-light">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative text-sm lg:text-base tracking-wider transition-colors duration-200
                  hover:text-primary
                  ${isActive(link) ? "text-primary font-medium" : "text-white/90"}
                `}
                aria-current={isActive(link) ? "page" : undefined}
              >
                <motion.span whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="inline-block">
                  {t(link.labelKey)}
                </motion.span>
                {isActive(link) && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="relative">
              <select
                aria-label="Select language"
                value={locale}
                onChange={(e) => setLocale(e.target.value as "es" | "en")}
                className="appearance-none bg-black/80 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1.5 pr-7 text-sm text-white font-noto-serif cursor-pointer hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option className="text-white" value="es">
                  ES
                </option>
                <option className="text-white" value="en">
                  EN
                </option>
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMenu}
              className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors hover:bg-white/10"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ease-out ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ease-out my-1 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ease-out ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Backdrop oscuro (solo cuando el menú está abierto) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed inset-x-0 z-40 md:hidden transition-all duration-300 ${
              isScrolled ? "top-14 md:top-16" : "top-16 md:top-20"
            }`}
          >
            <div className="bg-black/95 backdrop-blur-lg border-t border-white/10 shadow-2xl">
              <motion.nav
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center py-8 space-y-2"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.href} variants={menuItemVariants} className="w-full">
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className={`
                        block w-full text-center text-lg py-3 px-4 rounded-lg transition-colors duration-200 font-noto-serif tracking-widest
                        hover:bg-white/10 hover:text-primary active:bg-white/20
                        ${isActive(link) ? "text-primary font-medium bg-white/5" : "text-white/90"}
                      `}
                      aria-current={isActive(link) ? "page" : undefined}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavbarComponent;
