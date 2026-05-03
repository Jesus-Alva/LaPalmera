"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "../../lib/hooks/useTranslation";
import { useLang } from "../../lib/i18n/LanguageProvider";

interface ComponentProps {
  logo: string;
 }

const NavbarComponent: React.FC<ComponentProps> = ({ logo }) => {
  const { t } = useTranslation();
  const { locale, setLocale } = useLang();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 backdrop-blur-sm bg-black/40 h-18.75">
      <div className="container h-full mx-auto px-4 flex items-center justify-between gap-11">
        <div className="flex h-full w-auto items-center space-x-2">
          <Image src={logo} alt="Logo" className="h-full w-auto" width={500} height={500} />
        </div>
        <div className="flex items-center space-x-6">
          <nav className="space-x-20 text-white font-noto-serif font-light">
            <a href="#inicio" className="hover:text-primary hover:scale-105 tracking-widest hover:transition duration-75">{t('inicio.navbar.opt1')}</a>
            <a href="#tecnologias" className="hover:text-primary hover:scale-105 tracking-widest hover:transition duration-75">{t('inicio.navbar.opt2')}</a>
            <a href="#galeria" className="hover:text-primary hover:scale-105 tracking-widest hover:transition duration-75">{t('inicio.navbar.opt3')}</a>
            <a href="#nosotros" className="hover:text-primary hover:scale-105 tracking-widest hover:transition duration-75">{t('inicio.navbar.opt4')}</a>
            <a href="#contacto" className="hover:text-primary hover:scale-105 tracking-widest hover:transition duration-75">{t('inicio.navbar.opt5')}</a>
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
  )
}

export default NavbarComponent;