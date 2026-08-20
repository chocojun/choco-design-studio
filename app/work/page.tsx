"use client";

import { ClippingGallery } from "@/components/clipping-gallery";
import { PageFrame } from "@/components/site-shell";
import { clippings } from "@/lib/clippings";
import { useLanguage } from "@/components/language-provider";

export default function WorkPage() {
  const { text } = useLanguage();

  return (
    <PageFrame>
      <div className="work-intro">
        <div>
          <p className="fb-ui-label uppercase text-[var(--muted)]">{text.work.eyebrow}</p>
        </div>
        <p>
          {text.work.intro}
        </p>
      </div>

      <ClippingGallery items={clippings} />
    </PageFrame>
  );
}
