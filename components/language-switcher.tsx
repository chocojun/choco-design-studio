"use client";

import { useId } from "react";
import { locales } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";

export function LanguageSwitcher() {
  const languageSelectId = useId();
  const { locale, setLocale } = useLanguage();

  return (
    <div className="language-switcher">
      <div aria-label="Language switcher" className="language-buttons">
        {locales.map((item) => (
          <button
            aria-pressed={locale === item.code}
            className={`language-button ${
              locale === item.code ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)]"
            }`}
            key={item.code}
            onClick={() => setLocale(item.code)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor={languageSelectId}>
        Language
      </label>
      <select
        className="language-select"
        id={languageSelectId}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        value={locale}
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-[9px] uppercase text-[var(--muted)]">LANGUAGE: {locale}</p>
    </div>
  );
}
