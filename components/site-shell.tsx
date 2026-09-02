"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { FluidPageEffects } from "@/components/fluid-page-effects";
import { useLanguage } from "@/components/language-provider";
import { MusicPlayer } from "@/components/music-player";
import { withBasePath } from "@/lib/site-path";

type ThemeMode = "day" | "night";

function themeFromLocalClock(date = new Date()): ThemeMode {
  const hour = date.getHours();
  return hour >= 7 && hour < 19 ? "day" : "night";
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { text } = useLanguage();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("day");
  const [isThemePreview, setIsThemePreview] = useState(false);
  const navItems = [
    { href: "/", label: text.nav.index },
    { href: "/work", label: text.nav.work },
    { href: "/about", label: text.nav.about },
    { href: "/contact", label: text.nav.contact },
  ];

  useEffect(() => {
    const syncWithClock = () => {
      if (!isThemePreview) setThemeMode(themeFromLocalClock());
    };

    syncWithClock();
    const timer = window.setInterval(syncWithClock, 60_000);
    return () => window.clearInterval(timer);
  }, [isThemePreview]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode === "night" ? "dark" : "light";
  }, [themeMode]);

  const toggleThemePreview = () => {
    setIsThemePreview(true);
    setThemeMode((mode) => (mode === "day" ? "night" : "day"));
  };

  const isNightMode = themeMode === "night";

  return (
    <div className={`site-shell min-h-screen text-[var(--foreground)] ${isNightMode ? "is-night-mode" : "is-day-mode"}`}>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="brand-mark" onClick={() => setIsMenuOpen(false)}>
            <Image alt="Lavie" height={573} priority src={withBasePath("/assets/lavie-handwritten-logo.png")} width={1212} />
          </Link>

          <nav aria-label="Primary navigation" className="desktop-nav">
            {navItems.map((item) => (
              <Link
                aria-current={pathname === item.href ? "page" : undefined}
                key={item.href}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-tools">
            <button
              aria-label={isNightMode ? "切换至日间模式" : "切换至夜间模式"}
              aria-pressed={isNightMode}
              className="surface-mode-toggle"
              onClick={toggleThemePreview}
              title={`${isNightMode ? "夜间" : "日间"}模式${isThemePreview ? " · 手动预览" : " · 自动跟随本地时间"}`}
              type="button"
            >
              {isNightMode
                ? <Moon aria-hidden="true" size={15} strokeWidth={1.8} />
                : <Sun aria-hidden="true" size={15} strokeWidth={1.8} />}
            </button>
            <LanguageSwitcher />
            <button
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              className="menu-button"
              onClick={() => setIsMenuOpen((value) => !value)}
              type="button"
            >
              <span className="sr-only">Toggle navigation menu</span>
              <span aria-hidden="true">{isMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>

        <nav
          aria-label="Mobile navigation"
          className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}
          id="mobile-menu"
        >
          <div className="mobile-menu-grid">
            {navItems.map((item) => (
              <Link
                aria-current={pathname === item.href ? "page" : undefined}
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <LanguageSwitcher />
        </nav>
      </header>

      <main>{children}</main>
      <FluidPageEffects />
      <MusicPlayer />
    </div>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="page-frame">{children}</div>;
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
