"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const NavbarComponent: React.FC<ComponentProps> = ({ logo }) => {
  const { t } = useTranslation();
  const { locale, setLocale } = useLang();
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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
    { href: "#nosotros", labelKey: "inicio.navbar.opt4", isAnchor: true },
    { href: "#contacto", labelKey: "inicio.navbar.opt5", isAnchor: true },
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
      <header className="fixed top-0 right-0 left-0 z-50 h-16 md:h-20 bg-linear-to-r from-black/80 via-black/60 to-black/40 backdrop-blur-md shadow-md border-b border-white/10">
        <div className="container mx-auto h-full px-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex h-full items-center justify-center">
            <Image
                src={logo}
                alt="Logo"
                className="h-full w-auto max-h-12 md:max-h-full"
                width={500}
                height={500}
                priority
              />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-12 text-white font-noto-serif font-light">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative text-sm lg:text-base tracking-wider transition-all duration-200 
                  hover:text-primary hover:scale-105
                  ${isActive(link) ? "text-primary font-medium" : "text-white/90"}
                `}
                aria-current={isActive(link) ? "page" : undefined}
              >
                {t(link.labelKey)}
                {/* Línea decorativa en enlace activo (opcional) */}
                {isActive(link) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side: Language selector + Hamburger */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Selector de idioma personalizado */}
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
              {/* Flecha personalizada */}
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botón hamburguesa (solo móvil) */}
            <button
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
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-x-0 top-16 md:top-20 z-40 transition-all duration-300 ease-out md:hidden
          ${isMenuOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-4 pointer-events-none"}
        `}
      >
        <div className="bg-black/95 backdrop-blur-lg border-t border-white/10 shadow-2xl">
          <nav className="flex flex-col items-center py-8 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`
                  w-full text-center text-lg  py-3 px-4 transition-all duration-200 font-noto-serif tracking-widest
                  hover:bg-white/10 hover:text-primary active:bg-white/20
                  ${isActive(link) ? "text-primary font-medium bg-white/5" : "text-white/90"}
                `}
                aria-current={isActive(link) ? "page" : undefined}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Backdrop oscuro (solo cuando el menú está abierto) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default NavbarComponent;