"use client";

import { useLang } from '../i18n/LanguageProvider';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

const translations = { en, es };

export function useTranslation() {
  const { locale } = useLang();
  const dict = translations[locale] || translations.en;

  // Sobrecarga: sin returnObjects -> string
  function t(key: string): string;
  // Sobrecarga: con returnObjects -> unknown
  function t(key: string, options: { returnObjects: true }): unknown;
  // Implementación
  function t(key: string, options?: { returnObjects?: boolean }): unknown {
    const keys = key.split('.');
    let result: any = dict;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
    }

    if (options?.returnObjects) {
      return result;
    }
    return typeof result === 'string' ? result : key;
  }

  return { t };
}