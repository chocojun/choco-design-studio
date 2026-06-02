"use client";

import { locales } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div>
      <div aria-label="Language switcher" className="inline-flex flex-wrap border border-[var(--line)] bg-[var(--background)] text-[10px] uppercase">
        {locales.map((item) => (
          <button
            aria-pressed={locale === item.code}
            className={`border-r border-[var(--line)] px-2 py-1 last:border-r-0 ${
              locale === item.code ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)]"
            }`}
            key={item.code}
            onClick={() => setLocale(item.code)}
            onPointerDown={() => setLocale(item.code)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[9px] uppercase text-[var(--muted)]">LANGUAGE: {locale}</p>
    </div>
  );
}
