"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useLanguage } from "@/components/language-provider";
import { PageFrame } from "@/components/site-shell";
import type { Locale } from "@/lib/i18n";
import { withBasePath } from "@/lib/site-path";
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
    contact: "Let’s play it cool.",
  },
  "zh-CN": {
    statement: ["感知，创造，", "关于美的一切。"],
    statementBody: "Lavie 游走于时装、物件、视觉身份与数字文化之间。",
    contact: "Let’s play it cool.",
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
              src={withBasePath("/assets/lavie-handwritten-logo.png")}
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
          <h2 className="sr-only" id="contact-title">{copy.contact}</h2>
          <svg aria-hidden="true" className="lavie-contact-curve" viewBox="0 0 1200 380">
            <path d="M 30 230 C 235 30, 430 25, 605 188 C 785 355, 980 340, 1170 92" fill="none" id="lavie-contact-path" />
            <text>
              <textPath href="#lavie-contact-path" startOffset="2%">Let’s play it cool.</textPath>
            </text>
          </svg>
          <a href="mailto:casparjang@outlook.com">casparjang@outlook.com ↗</a>
        </section>
      </div>
    </PageFrame>
  );
}
