"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bridge from the video hero into the rest of the site. Each word fades in
 * as the section scrolls through, powered by GSAP ScrollTrigger scrub.
 */
export function HeroTransition() {
  const t = useTranslations("Transition");
  const sectionRef = useRef<HTMLElement>(null);
  const words = t("title").split(" ");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const wordEls = section.querySelectorAll("[data-word]");

      // Each word starts dim and lights up as the section scrolls
      gsap.set(wordEls, { opacity: 0.12 });

      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "bottom 30%",
        scrub: 0.5,
        onUpdate: (self) => {
          wordEls.forEach((el, i) => {
            const wordStart = i / wordEls.length;
            const wordEnd = (i + 1) / wordEls.length;
            const progress = gsap.utils.clamp(0, 1, (self.progress - wordStart) / (wordEnd - wordStart));
            gsap.set(el, { opacity: 0.12 + progress * 0.88 });
          });
        },
      });

      // Body text fade in
      gsap.from("[data-transition-body]", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-transition-body]",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="film-grain bg-surface-dark text-surface-dark-foreground"
    >
      <div className="mx-auto max-w-[1100px] px-6 py-32 text-center md:py-48">
        <h2 className="font-heading text-[clamp(40px,9vw,110px)] leading-[0.98] font-semibold tracking-[-0.035em]">
          {words.map((word, i) => (
            <span key={i} data-word className="inline-block transition-opacity duration-100">
              {word}
              {i < words.length - 1 && " "}
            </span>
          ))}
        </h2>
        <p
          data-transition-body
          className="mx-auto mt-8 max-w-[640px] text-[16px] leading-relaxed text-surface-dark-foreground/55 md:text-[18px]"
        >
          {t("body")}
        </p>

        {/* Decorative hairline */}
        <div className="mx-auto mt-16 h-px w-16 bg-surface-dark-foreground/20" />
      </div>
    </section>
  );
}
