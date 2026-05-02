"use client";

import { useLang } from '../i18n/LanguageProvider';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

const translations = { en, es };

export const useTranslation = () => {
  const { locale } = useLang();
  const dict = translations[locale] || translations.en;

  const t = (key: string): string => {
    // Función para acceder a propiedades anidadas
    const keys = key.split('.');
    let result: any = dict;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.warn(`Translation missing for key: ${key}`);
        return key; // o devuelve una cadena vacía
      }
    }
    return typeof result === 'string' ? result : key;
  };

  return { t };
};