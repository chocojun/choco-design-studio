"use client";

import { useEffect, useState } from "react";
import type { Clipping } from "@/lib/clippings";
import { useLanguage } from "@/components/language-provider";

export function ClippingGallery({ items }: { items: Clipping[] }) {
  const [selected, setSelected] = useState<Clipping | null>(null);
  const { locale, text } = useLanguage();

  useEffect(() => {
    if (!selected) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  return (
    <>
      <div className="clipping-grid">
        {items.map((item) => (
          <article className="clipping-card" key={item.id}>
            <figure className="m-0">
              <button
                aria-label={`${text.work.still}: ${item.title[locale]}`}
                className="clipping-zoom-button"
                onClick={() => setSelected(item)}
                type="button"
              >
                <span className="clipping-image" style={{ aspectRatio: item.ratio }}>
                  <img alt={`${item.title[locale]} clipping artwork`} loading="lazy" src={item.src} />
                </span>
              </button>
            </figure>

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

      {selected && (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={selected.title[locale]}>
          <button className="image-lightbox-backdrop" onClick={() => setSelected(null)} type="button" />
          <figure className="image-lightbox-panel">
            <img alt={`${selected.title[locale]} full artwork`} src={selected.src} />
            <figcaption>
              <span>
                {selected.id} / {selected.year}
              </span>
              <span>{selected.title[locale]}</span>
            </figcaption>
            <button className="image-lightbox-close" onClick={() => setSelected(null)} type="button">
              {text.work.closeMotion}
            </button>
          </figure>
        </div>
      )}
    </>
  );
}
