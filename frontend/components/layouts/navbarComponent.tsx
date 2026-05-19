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
    { href: "#galeria", labelKey: "inicio.navbar.opt3", isAnchor: true },
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

  return (
    <header className="fixed top-0 right-0 left-0 z-50 backdrop-blur-sm bg-black/40 h-18.75">
      <div className="container h-full mx-auto px-4 flex items-center justify-between gap-11">
        <div className="flex h-full w-auto items-center space-x-2">
          <Image src={logo} alt="Logo" className="h-full w-auto" width={500} height={500} />
        </div>
        <div className="flex items-center space-x-6">
          <nav className="space-x-20 text-white font-noto-serif font-light">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  nav-link hover:text-primary hover:scale-105 tracking-widest transition duration-75
                  ${isActive(link) ? "active text-primary" : ""}
                `}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
        <select
          aria-label="Select language"
          value={locale}
          onChange={(e) => setLocale(e.target.value as 'es' | 'en')}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm text-white font-noto-serif bg-black"
        >
          <option className="text-white" value="es">ES</option>
          <option className="text-white" value="en">EN</option>
        </select>
      </div>
    </header>
  );
};

export default NavbarComponent;