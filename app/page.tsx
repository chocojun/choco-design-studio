"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useLanguage } from "@/components/language-provider";
import { PageFrame } from "@/components/site-shell";
import type { Locale } from "@/lib/i18n";
import styles from "./home.module.css";

const MobiusField = dynamic(
  () => import("@/components/mobius-field").then((module) => module.MobiusField),
  { ssr: false },
);

type HomeCopy = {
  statement: [string, string];
  statementBody: string;
  contact: string;
};

const homeCopy: Record<Locale, HomeCopy> = {
  en: {
    statement: ["Perception. Creation.", "Everything beautiful."],
    statementBody:
      "Lavie moves between fashion, objects, visual identity and digital culture.",
    contact: "Let’s make something that moves.",
  },
  "zh-CN": {
    statement: ["感知，创造，", "关于美的一切。"],
    statementBody: "Lavie 游走于时装、物件、视觉身份与数字文化之间。",
    contact: "一起做点会流动的东西。",
  },
  "zh-TW": {
    statement: ["感知，創造，", "關於美的一切。"],
    statementBody: "Lavie 遊走於時裝、物件、視覺身份與數位文化之間。",
    contact: "一起做點會流動的東西。",
  },
};

export default function Home() {
  const { locale } = useLanguage();
  const copy = homeCopy[locale];

  return (
    <PageFrame>
      <div className={`${styles.scope} lavie-experience`}>
        <MobiusField />

        <section aria-labelledby="home-title" className="lavie-hero">
          <h1 className="sr-only" id="home-title">
            Lavie
          </h1>
          <div className="lavie-logo-lockup">
            <Image
              alt="Lavie"
              height={573}
              priority
              sizes="(max-width: 767px) 84vw, 62vw"
              src="/assets/lavie-handwritten-logo.png"
              width={1212}
            />
          </div>
        </section>

        <section aria-labelledby="statement-title" className="lavie-manifesto">
          <div>
            <h2 data-static-heading="true" id="statement-title">
              {copy.statement.map((line) => <span key={line}>{line}</span>)}
            </h2>
            <p>{copy.statementBody}</p>
          </div>
        </section>

        <section aria-labelledby="contact-title" className="lavie-contact">
          <h2 id="contact-title">{copy.contact}</h2>
          <a href="mailto:casparjang@outlook.com">casparjang@outlook.com ↗</a>
        </section>
      </div>
    </PageFrame>
  );
}
