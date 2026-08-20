"use client";

import { ArrowLeft, ArrowRight, Download, Expand, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Clipping } from "@/lib/clippings";
import type { Locale } from "@/lib/i18n";

const galleryCopy: Record<Locale, { download: string; enlarge: string; next: string; previous: string; type: string }> = {
  en: { download: "Download original", enlarge: "View full size", next: "Next work", previous: "Previous work", type: "Artwork type" },
  "zh-CN": { download: "下载原图", enlarge: "放大查看", next: "下一件作品", previous: "上一件作品", type: "作品类型" },
  "zh-TW": { download: "下載原圖", enlarge: "放大查看", next: "下一件作品", previous: "上一件作品", type: "作品類型" },
};

export function ClippingGallery({ items }: { items: Clipping[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<Clipping | null>(null);
  const { locale, text } = useLanguage();
  const copy = galleryCopy[locale];
  const active = items[activeIndex];

  const move = (direction: number) => {
    setActiveIndex((index) => (index + direction + items.length) % items.length);
  };

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (selected) {
        if (event.key === "Escape") setSelected(null);
        return;
      }
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }

    if (selected) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [selected, items.length]);

  if (!active) return null;

  return (
    <>
      <section aria-label={active.title[locale]} aria-live="polite" className="exhibition-slideshow">
        <button aria-label={copy.previous} className="slide-physical-button is-previous" onClick={() => move(-1)} type="button">
          <ArrowLeft aria-hidden="true" size={22} strokeWidth={1.6} />
        </button>

        <article className="exhibit-panel exhibit-slide" key={active.id}>
          <div className="exhibit-index" aria-hidden="true">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            <span>{String(items.length).padStart(2, "0")}</span>
          </div>

          <div className="exhibit-object">
            <span aria-hidden="true" className="metal-ripple metal-ripple-one" />
            <span aria-hidden="true" className="metal-ripple metal-ripple-two" />
            <span aria-hidden="true" className="metal-ripple metal-ripple-three" />
            <button
              aria-label={`${copy.enlarge}: ${active.title[locale]}`}
              className="exhibit-image-button"
              onClick={() => setSelected(active)}
              type="button"
            >
              <img alt={`${active.title[locale]}, ${active.medium[locale]}`} src={active.src} />
              <span className="exhibit-expand"><Expand size={15} /> {copy.enlarge}</span>
            </button>
          </div>

          <div className="exhibit-caption">
            <p className="exhibit-accession">{active.id} / {active.year}</p>
            <h2 data-static-heading="true">{active.title[locale]}</h2>
            <dl>
              <div>
                <dt>{copy.type}</dt>
                <dd>{active.medium[locale]}</dd>
              </div>
            </dl>
            <p className="exhibit-note">{active.note[locale]}</p>
            <a className="exhibit-download" download href={active.src}>
              <Download aria-hidden="true" size={15} /> {copy.download}
            </a>
          </div>
        </article>

        <button aria-label={copy.next} className="slide-physical-button is-next" onClick={() => move(1)} type="button">
          <ArrowRight aria-hidden="true" size={22} strokeWidth={1.6} />
        </button>
      </section>

      {selected && (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={selected.title[locale]}>
          <button className="image-lightbox-backdrop" onClick={() => setSelected(null)} type="button" />
          <figure className="image-lightbox-panel">
            <img alt={`${selected.title[locale]} full artwork`} src={selected.src} />
            <figcaption>
              <span>{selected.id} / {selected.year}</span>
              <span>{selected.title[locale]} · {selected.medium[locale]}</span>
              <a download href={selected.src}><Download size={14} /> {copy.download}</a>
            </figcaption>
            <button className="image-lightbox-close" onClick={() => setSelected(null)} type="button">
              <X aria-hidden="true" size={17} />
              <span className="sr-only">{text.work.closeMotion}</span>
            </button>
          </figure>
        </div>
      )}
    </>
  );
}
