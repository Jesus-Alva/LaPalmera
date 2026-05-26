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

  // Cerrar menú al cambiar tamaño de pantalla (si pasa a desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <header className="fixed top-0 right-0 left-0 z-50 backdrop-blur-sm bg-black/40 h-18.75">
      <div className="container h-full mx-auto px-4 flex items-center justify-between gap-4 md:gap-11">
        {/* Logo */}
        <div className="flex h-full w-auto items-center space-x-2">
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
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-20 text-white font-noto-serif font-light">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                nav-link hover:text-primary hover:scale-105 tracking-widest transition duration-75 whitespace-nowrap
                ${isActive(link) ? "active text-primary" : ""}
              `}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right side: Language selector + Hamburger (mobile only) */}
        <div className="flex items-center gap-3 md:gap-4">
          <select
            aria-label="Select language"
            value={locale}
            onChange={(e) => setLocale(e.target.value as "es" | "en")}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm text-white font-noto-serif bg-black/80 backdrop-blur-sm cursor-pointer"
          >
            <option className="text-white" value="es">
              ES
            </option>
            <option className="text-white" value="en">
              EN
            </option>
          </select>

          {/* Botón hamburguesa (solo móvil) */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1.5 focus:outline-none"
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu (Overlay) */}
      <div
        className={`fixed inset-x-0 top-[calc(100%+0px)] z-40 transition-all duration-300 ease-in-out md:hidden ${
          isMenuOpen
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-black/90 backdrop-blur-md border-t border-white/10 shadow-xl">
          <nav className="flex flex-col items-center py-6 space-y-5 text-white font-noto-serif font-light">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`
                  text-lg tracking-widest py-2 px-4 rounded-md transition-colors w-full text-center
                  hover:bg-white/10 hover:text-primary
                  ${isActive(link) ? "active text-primary" : ""}
                `}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Fondo oscuro opcional cuando el menú está abierto (backdrop) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 -z-10 bg-black/50 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default NavbarComponent;