"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/components/language-provider";

export function SiteShell({ children }: { children: ReactNode }) {
  const { text } = useLanguage();
  const navItems = [
    { href: "/", label: text.nav.index },
    { href: "/work", label: text.nav.work },
    { href: "/ai", label: text.nav.ai },
    { href: "/about", label: text.nav.about },
    { href: "/contact", label: text.nav.contact },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-[220px] border-r border-[var(--line)] px-6 py-6 md:flex md:flex-col md:justify-between">
        <div>
          <Link href="/" className="block text-[11px] uppercase leading-tight no-underline">
            Choco
            <br />
            Design Studio
          </Link>
          <nav className="mt-16 flex flex-col gap-2 text-[11px] uppercase text-[var(--muted)]">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="text-[10px] uppercase leading-relaxed text-[var(--muted)]">
          <LanguageSwitcher />
          <br />
          {text.shell.portfolio}
          <br />
          {text.shell.ai}
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/95 px-4 py-4 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[11px] uppercase no-underline">
            Choco Design Studio
          </Link>
          <LanguageSwitcher />
        </div>
        <nav className="mt-3 flex gap-3 text-[10px] uppercase text-[var(--muted)]">
          {navItems.slice(1).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="md:pl-[220px]">{children}</main>
    </div>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-screen px-4 py-8 md:px-10 md:py-10">{children}</div>;
}

export function MediaPlaceholder({
  label,
  tall = false,
}: {
  label: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`portrait-field media-grain relative overflow-hidden border border-[var(--line)] ${
        tall ? "min-h-[560px]" : "min-h-[360px]"
      } surface-3d tilt-plane`}
    >
      <div className="absolute inset-x-[20%] top-[16%] h-[52%] border border-black/20 bg-white/20 shadow-[8px_8px_0_rgba(17,17,17,0.12)]" />
      <div className="absolute bottom-[22%] right-[14%] h-[26%] w-[22%] border border-black/15 bg-black/5 shadow-[6px_6px_0_rgba(17,17,17,0.08)]" />
      <div className="absolute bottom-4 left-4 text-[10px] uppercase text-black/55">{label}</div>
      <div className="absolute right-4 top-4 text-[10px] uppercase text-black/45">visual placeholder</div>
    </div>
  );
}
