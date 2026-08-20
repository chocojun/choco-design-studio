"use client";

import { Download, Expand, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Clipping } from "@/lib/clippings";
import type { Locale } from "@/lib/i18n";

const galleryCopy: Record<Locale, { download: string; enlarge: string; type: string }> = {
  en: { download: "Download original", enlarge: "View full size", type: "Artwork type" },
  "zh-CN": { download: "下载原图", enlarge: "放大查看", type: "作品类型" },
  "zh-TW": { download: "下載原圖", enlarge: "放大查看", type: "作品類型" },
};

export function ClippingGallery({ items }: { items: Clipping[] }) {
  const [selected, setSelected] = useState<Clipping | null>(null);
  const { locale, text } = useLanguage();
  const copy = galleryCopy[locale];

  useEffect(() => {
    if (!selected) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
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
      <div className="exhibition-sequence">
        {items.map((item, index) => (
          <article className="exhibit-panel" key={item.id}>
            <div className="exhibit-index" aria-hidden="true">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{String(items.length).padStart(2, "0")}</span>
            </div>

            <div className="exhibit-object">
              <span aria-hidden="true" className="metal-ripple metal-ripple-one" />
              <span aria-hidden="true" className="metal-ripple metal-ripple-two" />
              <span aria-hidden="true" className="metal-ripple metal-ripple-three" />
              <button
                aria-label={`${copy.enlarge}: ${item.title[locale]}`}
                className="exhibit-image-button"
                onClick={() => setSelected(item)}
                type="button"
              >
                <img alt={`${item.title[locale]}, ${item.medium[locale]}`} loading="lazy" src={item.src} />
                <span className="exhibit-expand"><Expand size={15} /> {copy.enlarge}</span>
              </button>
            </div>

            <div className="exhibit-caption">
              <p className="exhibit-accession">{item.id} / {item.year}</p>
              <h2>{item.title[locale]}</h2>
              <dl>
                <div>
                  <dt>{copy.type}</dt>
                  <dd>{item.medium[locale]}</dd>
                </div>
              </dl>
              <p className="exhibit-note">{item.note[locale]}</p>
              <a className="exhibit-download" download href={item.src}>
                <Download aria-hidden="true" size={15} /> {copy.download}
              </a>
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
