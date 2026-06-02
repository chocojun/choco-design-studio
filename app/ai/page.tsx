"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { PageFrame } from "@/components/site-shell";

const outputs = [
  "/clippings/01-tea-for-two.jpg",
  "/clippings/08-rabbit-scarf.png",
  "/clippings/14-mouth-heat.png",
  "/clippings/18-ipod-eye.png",
];

export default function AiPage() {
  const { text } = useLanguage();
  const [selected, setSelected] = useState(0);
  const [generated, setGenerated] = useState(false);

  return (
    <PageFrame>
      <section className="grid gap-10 md:grid-cols-[280px_1fr]">
        <div>
          <p className="text-[10px] uppercase text-[var(--muted)]">{text.ai.eyebrow}</p>
          <h1 className="mt-20 text-[18px] font-normal leading-snug">{text.ai.title}</h1>
          <p className="mt-8 leading-relaxed text-[12px] text-[var(--muted)]">{text.ai.body}</p>
          <p className="mt-8 border-t border-[var(--line)] pt-4 text-[10px] uppercase leading-relaxed text-[var(--muted)]">
            {text.ai.disclaimer}
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1fr_320px]">
          <div className="surface-3d border border-[var(--line)] bg-[var(--panel)] p-4">
            <p className="mb-4 text-[10px] uppercase text-[var(--muted)]">{text.ai.input}</p>
            <div className="flex min-h-[520px] flex-col items-center justify-center border border-dashed border-black/30 bg-[var(--background)] p-6 text-center">
              <div className="h-44 w-32 border border-[var(--line)] bg-white/40 shadow-[8px_8px_0_rgba(17,17,17,0.12)]" />
              <p className="mt-8 text-[10px] uppercase text-[var(--muted)]">{text.ai.upload}</p>
              <p className="mt-5 max-w-[240px] leading-relaxed text-[12px] text-[var(--muted)]">{text.ai.uploadBody}</p>
              <button
                className="mt-8 border border-black bg-[var(--background)] px-5 py-2 text-[10px] uppercase shadow-[4px_4px_0_rgba(17,17,17,0.18)]"
                onClick={() => setGenerated(false)}
                type="button"
              >
                {text.ai.choose}
              </button>
            </div>
          </div>

          <div className="surface-3d border border-[var(--line)] bg-[var(--background)] p-4">
            <div className="mb-4 flex items-center justify-between text-[10px] uppercase text-[var(--muted)]">
              <span>{text.ai.preview}</span>
              <span>{generated ? "READY" : "WAITING"}</span>
            </div>
            <div className="relative min-h-[520px] overflow-hidden border border-[var(--line)] bg-[var(--panel)]">
              <img
                alt={`${text.ai.preview} ${text.ai.styles[selected]}`}
                className={`h-full min-h-[520px] w-full object-cover transition duration-500 ${
                  generated ? "scale-100 opacity-100" : "scale-105 opacity-45 grayscale"
                }`}
                src={outputs[selected]}
              />
              {!generated && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/40">
                  <button
                    className="border border-black bg-[var(--background)] px-5 py-3 text-[10px] uppercase shadow-[5px_5px_0_rgba(17,17,17,0.2)]"
                    onClick={() => setGenerated(true)}
                    type="button"
                  >
                    {text.ai.fakeRun}
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="border-t border-[var(--line)] xl:border-l xl:border-t-0 xl:pl-6">
            <div className="border-b border-[var(--line)] py-5">
              <p className="text-[10px] uppercase text-[var(--muted)]">{text.ai.concept}</p>
              <p className="mt-4 leading-relaxed text-[12px]">{text.ai.conceptBody}</p>
            </div>

            <div className="py-5">
              <p className="mb-4 text-[10px] uppercase text-[var(--muted)]">{text.ai.style}</p>
              <div className="grid gap-3">
                {text.ai.styles.map((style, index) => (
                  <button
                    aria-pressed={selected === index}
                    className={`surface-3d flex items-center justify-between border border-[var(--line)] bg-[var(--background)] px-3 py-4 text-left text-[11px] uppercase ${
                      selected === index ? "outline outline-1 outline-black" : ""
                    }`}
                    key={style}
                    onClick={() => {
                      setSelected(index);
                      setGenerated(false);
                    }}
                    type="button"
                  >
                    <span>{style}</span>
                    <span className="text-[var(--muted)]">0{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--line)] py-5 text-[10px] uppercase leading-relaxed text-[var(--muted)]">
              <p>
                {text.ai.selected}: {text.ai.styles[selected]}
              </p>
              {text.ai.steps.map((step, index) => (
                <p key={step}>
                  {index + 1}. {step}
                </p>
              ))}
              <p className="mt-5">{text.ai.mode}</p>
              <p>{text.ai.output}</p>
              <p>{text.ai.status}</p>
            </div>
          </aside>
        </div>
      </section>
    </PageFrame>
  );
}
