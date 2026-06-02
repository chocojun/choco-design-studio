"use client";

import { useLanguage } from "@/components/language-provider";
import { PageFrame } from "@/components/site-shell";

const history = [
  ["Chomunz1", "1st username in Aug, 2018"],
  ["輕輕", "2nd username in May, 2025"],
  ["Xiaoli_Miao", "3rd username in July, 2025"],
];

export default function AboutPage() {
  const { text } = useLanguage();
  const about = text.about;

  return (
    <PageFrame>
      <section className="grid min-h-[calc(100vh-80px)] gap-12 md:grid-cols-[240px_minmax(320px,760px)]">
        <div className="text-[10px] uppercase leading-relaxed text-[var(--muted)]">
          <p>{about.eyebrow}</p>
          <p className="mt-10">{about.edition}</p>
        </div>

        <div className="pt-14 md:pt-24">
          <div className="surface-3d border border-[var(--line)] bg-[var(--background)] p-5 md:p-7">
            <p className="text-[10px] uppercase text-[var(--muted)]">Choco Design Studio</p>
            <h1 className="mt-10 max-w-[560px] text-[18px] font-normal leading-snug">{about.title}</h1>
            <p className="text-archive mt-10 max-w-[560px] leading-relaxed text-[12px] text-[var(--muted)]">
              {about.float}
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-[1fr_1fr]">
            <div className="space-y-5 leading-relaxed text-[12px] text-[var(--muted)]">
              {about.lines.map((line) => (
                <p className={line.startsWith("“") ? "text-[var(--foreground)]" : ""} key={line}>
                  {line}
                </p>
              ))}
            </div>

            <div className="surface-3d border border-[var(--line)] bg-[var(--panel)] p-5 text-[11px] leading-relaxed text-[var(--muted)]">
              <p className="text-[10px] uppercase">{about.location}</p>
              {about.locationBody.map((line, index) => (
                <p className={index === 0 ? "mt-6" : ""} key={line}>
                  {line}
                </p>
              ))}
              <p className="mt-6 text-[10px] uppercase">{about.open}</p>
              <p className="mt-4">{about.openBody}</p>
            </div>
          </div>

          <div className="mt-16 border-t border-[var(--line)]">
            <p className="py-4 text-[10px] uppercase text-[var(--muted)]">{about.history}</p>
            {history.map(([name, note]) => (
              <div key={name} className="grid grid-cols-[120px_1fr] border-t border-[var(--line)] py-4 text-[12px]">
                <span>{name}</span>
                <span className="text-[var(--muted)]">{note}</span>
              </div>
            ))}
          </div>

          <ArchiveSection title={about.interests} lines={about.interestsBody} />
          <ArchiveSection title={about.languages} lines={about.languagesBody} />

          <div className="mt-16 grid gap-8 border-t border-[var(--line)] pt-8 md:grid-cols-[180px_1fr]">
            <p className="text-[10px] uppercase text-[var(--muted)]">{about.belief}</p>
            <div className="surface-3d border border-[var(--line)] bg-[var(--background)] p-5 leading-relaxed text-[12px] text-[var(--muted)]">
              <p className="text-[10px] uppercase">2024</p>
              {about.belief2024.map((line, index) => (
                <p className={index === 0 ? "mt-4" : ""} key={line}>
                  {line}
                </p>
              ))}
              <p className="mt-8 text-[10px] uppercase">2025</p>
              {about.belief2025.map((line, index) => (
                <p className={index === 0 ? "mt-4" : ""} key={line}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-8 border-t border-[var(--line)] pt-8 md:grid-cols-[180px_1fr]">
            <p className="text-[10px] uppercase text-[var(--muted)]">{about.doubts}</p>
            <div className="grid gap-3">
              {about.doubtList.map((doubt) => (
                <p key={doubt} className="border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[12px] text-[var(--muted)]">
                  {doubt}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

function ArchiveSection({ title, lines }: { title: string; lines: readonly string[] }) {
  return (
    <div className="mt-16 grid gap-8 border-t border-[var(--line)] pt-8 md:grid-cols-[180px_1fr]">
      <p className="text-[10px] uppercase text-[var(--muted)]">{title}</p>
      <div className="space-y-5 leading-relaxed text-[12px] text-[var(--muted)]">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
