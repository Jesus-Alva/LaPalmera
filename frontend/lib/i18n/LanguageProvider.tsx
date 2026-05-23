"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en from "./en.json";
import es from "./es.json";

type Locale = "es" | "en";

const messages: Record<Locale, any> = {
  en,
  es,
};

interface LangContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LangContextValue>({
  locale: "es",
  setLocale: () => {},
  t: (k) => k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("locale")) as Locale | null;
    if (stored === "en" || stored === "es") {
      setLocaleState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem("locale", l);
    document.documentElement.lang = l;
  };

  const t = (key: string) => {
    return messages[locale][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
