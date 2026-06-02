"use client";

import Link from "next/link";
import { PageFrame } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";

export default function Home() {
  const { text } = useLanguage();

  return (
    <PageFrame>
      <section className="grid min-h-[calc(100vh-80px)] gap-10 md:grid-cols-[minmax(240px,0.85fr)_minmax(360px,1.15fr)] md:gap-12">
        <div className="flex max-w-[520px] flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase text-[var(--muted)]">{text.home.eyebrow}</p>
            <h1 className="mt-20 max-w-[420px] text-[18px] font-normal leading-snug md:mt-28">
              {text.home.title}
            </h1>
            <p className="mt-10 max-w-[360px] leading-relaxed text-[12px] text-[var(--muted)]">
              {text.home.body}
            </p>
          </div>

          <div className="surface-3d mt-16 grid grid-cols-2 gap-x-8 gap-y-3 border border-[var(--line)] bg-[var(--background)] p-4 text-[11px] uppercase text-[var(--muted)]">
            <span>{text.home.current}</span>
            <Link href="/work">{text.home.work}</Link>
            <span>{text.home.prototype}</span>
            <Link href="/ai">{text.home.ai}</Link>
            <span>{text.home.contact}</span>
            <Link href="/contact">{text.home.email}</Link>
          </div>
        </div>

        <div className="self-stretch">
          <Link
            aria-label="Open clipping archive"
            className="surface-3d tilt-plane block overflow-hidden border border-[var(--line)] bg-[var(--panel)] no-underline"
            href="/work"
          >
            <img
              alt={text.home.featuredAlt}
              className="block min-h-[560px] w-full object-cover"
              loading="eager"
              src="/clippings/01-tea-for-two.jpg"
            />
          </Link>
          <div className="mt-3 flex justify-between text-[10px] uppercase text-[var(--muted)]">
            <span>C-001</span>
            <span>{text.home.caption}</span>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
