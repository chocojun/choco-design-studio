"use client";

import { useLanguage } from "@/components/language-provider";
import { PageFrame } from "@/components/site-shell";

export default function ContactPage() {
  const { text } = useLanguage();
  const links = [
    { label: text.contact.email, value: "gasparjang.05@gmail.com", href: "mailto:gasparjang.05@gmail.com" },
    { label: text.contact.instagram, value: "@casparjang_oo", href: "https://instagram.com/casparjang_oo" },
    { label: text.contact.arena, value: text.contact.channel, href: "#" },
    { label: text.contact.press, value: text.contact.request, href: "#" },
  ];

  return (
    <PageFrame>
      <section className="grid min-h-[calc(100vh-80px)] gap-12 md:grid-cols-[240px_minmax(320px,620px)]">
        <p className="text-[10px] uppercase text-[var(--muted)]">{text.contact.eyebrow}</p>
        <div className="pt-20 md:pt-28">
          <h1 className="text-[18px] font-normal leading-snug">{text.contact.title}</h1>
          <div className="mt-14 border-t border-[var(--line)]">
            {links.map((item) => (
              <div key={item.label} className="grid grid-cols-[120px_1fr] border-b border-[var(--line)] py-4 text-[12px]">
                <span className="text-[10px] uppercase text-[var(--muted)]">{item.label}</span>
                <a href={item.href}>{item.value}</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
