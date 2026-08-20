"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function FluidPageEffects() {
  const pathname = usePathname();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(
      "main h1:not(.sr-only):not([data-static-heading]), main h2:not([data-static-heading]), main h3:not([data-static-heading])",
    ));
    const headings = candidates.filter((heading) => Number.parseFloat(getComputedStyle(heading).fontSize) >= 30);

    headings.forEach((heading, index) => {
      heading.classList.add("liquid-reveal");
      heading.style.setProperty("--liquid-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });

    if (reducedMotion.matches) {
      headings.forEach((heading) => heading.classList.add("is-liquid-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-liquid-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12%", threshold: 0.12 });

    const revealVisibleHeadings = () => {
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
          heading.classList.add("is-liquid-visible");
          observer.unobserve(heading);
        }
      });
    };

    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener("scroll", revealVisibleHeadings, { passive: true });
    window.addEventListener("resize", revealVisibleHeadings, { passive: true });
    window.requestAnimationFrame(revealVisibleHeadings);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", revealVisibleHeadings);
      window.removeEventListener("resize", revealVisibleHeadings);
    };
  }, [pathname]);

  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const updateScroll = () => {
      const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, window.scrollY / range)})`;
    };

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="mercury-scroll-track"><div ref={progressRef} /></div>
  );
}
