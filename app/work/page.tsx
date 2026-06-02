"use client";

import { ClippingGallery } from "@/components/clipping-gallery";
import { PageFrame } from "@/components/site-shell";
import { clippings } from "@/lib/clippings";
import { useLanguage } from "@/components/language-provider";

export default function WorkPage() {
  const { text } = useLanguage();

  return (
    <PageFrame>
      <div className="mb-16 grid gap-8 md:grid-cols-[240px_1fr]">
        <div>
          <p className="text-[10px] uppercase text-[var(--muted)]">{text.work.eyebrow}</p>
        </div>
        <p className="max-w-[520px] text-[13px] leading-relaxed">
          {text.work.intro}
        </p>
      </div>

      <ClippingGallery items={clippings} />
    </PageFrame>
  );
}
