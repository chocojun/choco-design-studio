"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import type { Clipping } from "@/lib/clippings";
import { useLanguage } from "@/components/language-provider";

type MotionLayer = {
  clipPath: string;
  className: string;
};

const defaultLayers: MotionLayer[] = [
  { clipPath: "polygon(8% 5%, 62% 8%, 58% 32%, 10% 34%)", className: "motion-drift-a" },
  { clipPath: "polygon(30% 34%, 82% 30%, 88% 62%, 26% 67%)", className: "motion-drift-b" },
  { clipPath: "polygon(8% 66%, 92% 61%, 96% 94%, 4% 95%)", className: "motion-drift-c" },
];

const motionLayers: Record<string, MotionLayer[]> = {
  "C-001": [
    { clipPath: "polygon(62% 0%, 100% 0%, 100% 31%, 63% 31%)", className: "motion-hand" },
    { clipPath: "polygon(30% 28%, 100% 31%, 100% 52%, 30% 51%)", className: "motion-drift-b" },
    { clipPath: "polygon(34% 48%, 72% 48%, 70% 82%, 26% 82%)", className: "motion-drift-c" },
  ],
  "C-002": [
    { clipPath: "polygon(45% 0%, 100% 0%, 100% 36%, 46% 34%)", className: "motion-drift-a" },
    { clipPath: "polygon(30% 34%, 78% 32%, 80% 65%, 30% 66%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 73%, 48% 70%, 48% 100%, 0% 100%)", className: "motion-drift-c" },
  ],
  "C-003": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 55%, 0% 55%)", className: "motion-water" },
    { clipPath: "polygon(42% 62%, 60% 62%, 61% 100%, 40% 100%)", className: "motion-drift-b" },
  ],
  "C-004": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 34%, 0% 38%)", className: "motion-light" },
    { clipPath: "polygon(26% 30%, 76% 28%, 76% 72%, 22% 74%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 66%, 100% 64%, 100% 100%, 0% 100%)", className: "motion-light" },
  ],
  "C-005": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 31%, 0% 31%)", className: "motion-light" },
    { clipPath: "polygon(0% 48%, 100% 44%, 100% 70%, 0% 73%)", className: "motion-drift-b" },
    { clipPath: "polygon(5% 72%, 88% 70%, 92% 100%, 0% 100%)", className: "motion-drift-c" },
  ],
  "C-006": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 30%, 0% 31%)", className: "motion-drift-a" },
    { clipPath: "polygon(15% 30%, 90% 28%, 88% 67%, 12% 67%)", className: "motion-swirl" },
    { clipPath: "polygon(28% 70%, 76% 68%, 78% 96%, 24% 98%)", className: "motion-drift-c" },
  ],
  "C-007": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 28%, 0% 29%)", className: "motion-water" },
    { clipPath: "polygon(0% 28%, 100% 28%, 100% 63%, 0% 63%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)", className: "motion-light" },
  ],
  "C-008": [
    { clipPath: "polygon(0% 0%, 36% 0%, 36% 28%, 0% 32%)", className: "motion-drift-a" },
    { clipPath: "polygon(14% 32%, 85% 30%, 86% 61%, 13% 61%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 78%, 100% 77%, 100% 100%, 0% 100%)", className: "motion-drift-c" },
  ],
  "C-009": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 28%, 0% 29%)", className: "motion-water" },
    { clipPath: "polygon(0% 25%, 100% 14%, 100% 60%, 0% 67%)", className: "motion-water" },
    { clipPath: "polygon(25% 64%, 100% 60%, 100% 100%, 24% 100%)", className: "motion-drift-c" },
  ],
  "C-010": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 33%, 0% 37%)", className: "motion-swirl" },
    { clipPath: "polygon(0% 35%, 100% 30%, 100% 70%, 0% 70%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)", className: "motion-water" },
  ],
  "C-011": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 30%, 0% 31%)", className: "motion-hand" },
    { clipPath: "polygon(0% 32%, 100% 31%, 100% 55%, 0% 55%)", className: "motion-drift-a" },
    { clipPath: "polygon(18% 56%, 85% 55%, 88% 100%, 14% 100%)", className: "motion-drift-c" },
  ],
  "C-012": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 30%, 0% 32%)", className: "motion-drift-a" },
    { clipPath: "polygon(0% 29%, 84% 34%, 77% 62%, 0% 56%)", className: "motion-drift-b" },
    { clipPath: "polygon(30% 45%, 100% 45%, 100% 100%, 38% 100%)", className: "motion-drift-c" },
  ],
  "C-013": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 43%, 0% 45%)", className: "motion-light" },
    { clipPath: "polygon(28% 34%, 78% 30%, 82% 70%, 20% 72%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 62%, 100% 61%, 100% 100%, 0% 100%)", className: "motion-swirl" },
  ],
  "C-014": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 28%, 0% 34%)", className: "motion-drift-a" },
    { clipPath: "polygon(0% 30%, 100% 24%, 100% 60%, 0% 66%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 62%, 100% 55%, 100% 100%, 0% 100%)", className: "motion-light" },
  ],
  "C-015": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 29%, 0% 36%)", className: "motion-light" },
    { clipPath: "polygon(0% 28%, 100% 28%, 100% 58%, 0% 61%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 58%, 100% 58%, 100% 100%, 0% 100%)", className: "motion-drift-c" },
  ],
  "C-016": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 34%, 0% 34%)", className: "motion-light" },
    { clipPath: "polygon(0% 31%, 100% 31%, 100% 60%, 0% 60%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 60%, 100% 60%, 100% 100%, 0% 100%)", className: "motion-water" },
  ],
  "C-017": [
    { clipPath: "polygon(24% 0%, 78% 0%, 78% 31%, 24% 31%)", className: "motion-drift-a" },
    { clipPath: "polygon(14% 34%, 90% 33%, 88% 60%, 14% 60%)", className: "motion-hand" },
    { clipPath: "polygon(20% 62%, 82% 62%, 84% 100%, 18% 100%)", className: "motion-drift-c" },
  ],
  "C-018": [
    { clipPath: "polygon(52% 0%, 100% 0%, 100% 32%, 50% 34%)", className: "motion-drift-a" },
    { clipPath: "polygon(0% 25%, 100% 20%, 100% 58%, 0% 62%)", className: "motion-swirl" },
    { clipPath: "polygon(0% 61%, 100% 60%, 100% 100%, 0% 100%)", className: "motion-light" },
  ],
  "C-019": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 31%, 0% 31%)", className: "motion-drift-a" },
    { clipPath: "polygon(0% 30%, 100% 28%, 100% 62%, 0% 66%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 62%, 100% 62%, 100% 100%, 0% 100%)", className: "motion-drift-c" },
  ],
  "C-020": [
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 31%, 0% 38%)", className: "motion-water" },
    { clipPath: "polygon(18% 32%, 82% 31%, 82% 58%, 18% 58%)", className: "motion-drift-b" },
    { clipPath: "polygon(0% 61%, 100% 58%, 100% 100%, 0% 100%)", className: "motion-water" },
  ],
};

export function ClippingGallery({ items }: { items: Clipping[] }) {
  const [motionItem, setMotionItem] = useState<Clipping | null>(null);
  const { locale, text } = useLanguage();

  return (
    <>
      <div className="clipping-grid">
        {items.map((item) => (
          <article className="clipping-card" key={item.id}>
            <button className="clipping-button" onClick={() => setMotionItem(item)} type="button">
              <span className="clipping-image" style={{ aspectRatio: item.ratio }}>
                <img alt={`${item.title[locale]} clipping artwork`} loading="lazy" src={item.src} />
                <span className="clipping-play-badge">{text.work.playGif}</span>
              </span>
            </button>

            <div className="grid grid-cols-[72px_1fr] gap-x-4 border-t border-[var(--line)] pt-4 text-[11px]">
              <div className="uppercase leading-relaxed text-[var(--muted)]">
                <p>{item.id}</p>
                <p>{item.year}</p>
              </div>
              <div>
                <h2 className="text-[13px] font-normal">{item.title[locale]}</h2>
                <p className="mt-2 text-[10px] uppercase text-[var(--muted)]">{item.medium[locale]}</p>
                <p className="mt-5 leading-relaxed text-[12px] text-[var(--muted)]">{item.note[locale]}</p>
                <p className="mt-5 text-[10px] uppercase text-[var(--muted)]">{text.work.still}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {motionItem && (
        <MotionView
          closeLabel={text.work.closeMotion}
          hint={text.work.motionHint}
          item={motionItem}
          locale={locale}
          onClose={() => setMotionItem(null)}
        />
      )}
    </>
  );
}

function MotionView({
  closeLabel,
  hint,
  item,
  locale,
  onClose,
}: {
  closeLabel: string;
  hint: string;
  item: Clipping;
  locale: "zh-CN" | "zh-TW" | "en";
  onClose: () => void;
}) {
  const layers = motionLayers[item.id] ?? defaultLayers;

  return (
    <div className="motion-view" role="dialog" aria-modal="true" aria-label={item.title[locale]}>
      <button aria-label={closeLabel} className="motion-backdrop" onClick={onClose} type="button" />
      <div className="motion-panel">
        <div className="mb-4 flex items-start justify-between gap-6 text-[10px] uppercase text-[var(--muted)]">
          <div>
            <p>{item.id}</p>
            <p className="mt-1 text-[var(--foreground)]">{item.title[locale]}</p>
            <p className="mt-2">{hint}</p>
          </div>
          <button className="border border-[var(--line)] px-3 py-2 text-[10px] uppercase" onClick={onClose} type="button">
            {closeLabel}
          </button>
        </div>

        <div className="motion-stage" style={{ aspectRatio: item.ratio }}>
          <img alt={`${item.title[locale]} base artwork`} className="motion-base" src={item.src} />
          {layers.map((layer, index) => (
            <div
              aria-hidden
              className={`motion-cut ${layer.className}`}
              key={`${item.id}-${index}`}
              style={{ "--clip": layer.clipPath } as CSSProperties}
            >
              <img alt="" src={item.src} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
