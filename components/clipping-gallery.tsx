"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Download, Expand, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Clipping } from "@/lib/clippings";
import type { Locale } from "@/lib/i18n";

const galleryCopy: Record<Locale, {
  archive: string;
  download: string;
  enlarge: string;
  next: string;
  previous: string;
  works: string;
}> = {
  en: {
    archive: "Spatial archive",
    download: "Download original",
    enlarge: "View full size",
    next: "Next work",
    previous: "Previous work",
    works: "works",
  },
  "zh-CN": {
    archive: "空间档案",
    download: "下载原图",
    enlarge: "放大查看",
    next: "下一件作品",
    previous: "上一件作品",
    works: "件作品",
  },
};

export function ClippingGallery({ items }: { items: Clipping[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { locale, text } = useLanguage();
  const copy = galleryCopy[locale];
  const selectedIndex = useMemo(
    () => items.findIndex((item) => item.id === selectedId),
    [items, selectedId],
  );
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;

  const moveSelected = (direction: number) => {
    if (selectedIndex < 0) return;
    const nextIndex = (selectedIndex + direction + items.length) % items.length;
    setSelectedId(items[nextIndex].id);
  };

  useEffect(() => {
    if (!selected) return;

    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedId(null);
      if (event.key === "ArrowLeft") moveSelected(-1);
      if (event.key === "ArrowRight") moveSelected(1);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [selected, selectedIndex, items.length]);

  return (
    <>
      <section aria-label={copy.archive} className="spatial-archive">
        <header className="spatial-archive-ledger">
          <p>{copy.archive}</p>
          <p>{String(items.length).padStart(2, "0")} {copy.works}</p>
        </header>

        <div className="spatial-archive-field">
          {items.map((item, index) => (
            <article className="spatial-work" key={item.id}>
              <button
                aria-label={`${copy.enlarge}: ${item.title[locale]}`}
                className="spatial-work-image"
                onClick={() => setSelectedId(item.id)}
                style={{ aspectRatio: item.ratio }}
                type="button"
              >
                <Image
                  alt={`${item.title[locale]}, ${item.medium[locale]}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 767px) 82vw, (max-width: 1199px) 38vw, 29vw"
                  src={item.src}
                />
                <span className="spatial-work-open" aria-hidden="true">
                  <Expand size={14} strokeWidth={1.6} />
                </span>
              </button>

              <footer className="spatial-work-caption">
                <div>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{item.id} / {item.year}</span>
                </div>
                <h2 data-static-heading="true">{item.title[locale]}</h2>
                <p>{item.medium[locale]}</p>
              </footer>
            </article>
          ))}
        </div>
      </section>

      {selected && (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={selected.title[locale]}>
          <button className="image-lightbox-backdrop" onClick={() => setSelectedId(null)} type="button" />
          <button
            aria-label={copy.previous}
            className="image-lightbox-nav is-previous"
            onClick={() => moveSelected(-1)}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={1.5} />
          </button>
          <figure className="image-lightbox-panel">
            <div className="image-lightbox-art" style={{ aspectRatio: selected.ratio }}>
              <Image
                alt={`${selected.title[locale]} full artwork`}
                fill
                priority
                sizes="(max-width: 767px) 88vw, 76vw"
                src={selected.src}
              />
            </div>
            <figcaption>
              <span>{selected.id} / {selected.year}</span>
              <span>{selected.title[locale]} · {selected.medium[locale]}</span>
              <a download href={selected.src}><Download size={14} /> {copy.download}</a>
            </figcaption>
            <button className="image-lightbox-close" onClick={() => setSelectedId(null)} type="button">
              <X aria-hidden="true" size={17} />
              <span className="sr-only">{text.work.closeMotion}</span>
            </button>
          </figure>
          <button
            aria-label={copy.next}
            className="image-lightbox-nav is-next"
            onClick={() => moveSelected(1)}
            type="button"
          >
            <ArrowRight aria-hidden="true" size={20} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </>
  );
}
