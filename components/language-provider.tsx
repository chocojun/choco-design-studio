"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copy, locales, type Locale } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  text: (typeof copy)[Locale];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "zh-CN";
  }

  const language = navigator.language.toLowerCase();
  if (language.startsWith("zh")) {
    return "zh-CN";
  }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-CN");

  useEffect(() => {
    let stored: Locale | null = null;
    try {
      stored = window.localStorage.getItem("lavie-locale") as Locale | null;
    } catch {
      stored = null;
    }
    const nextLocale = stored && locales.some((item) => item.code === stored) ? stored : detectLocale();
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  const setLocale = (nextLocale: Locale) => {
    try {
      window.localStorage.setItem("lavie-locale", nextLocale);
    } catch {
      // Language switching should still work when storage is unavailable.
    }
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      text: copy[locale],
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return value;
}
