"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { useEditorialReveal } from "@/hooks/use-editorial-reveal";

/**
 * The bridge from the video hero into the rest of the site: one oversized
 * manifesto statement whose words light up in reading order as it crosses
 * the viewport, scrubbed to scroll position with ScrollTrigger (no pinning).
 * This word-lighting mechanism is untouched by the editorial rebrand — it's
 * a more considered effect than a generic reveal, so it stays exactly as
 * built; only its color and type now follow the new mono system. Gated
 * behind `gsap.matchMedia`'s `prefers-reduced-motion: no-preference` branch —
 * under reduced motion the branch never runs, so the words are simply never
 * dimmed and the heading reads as plain static text from the first paint.
 */
export function HeroTransition() {
  const t = useTranslations("Transition");
  const words = t("title").split(" ");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useEditorialReveal();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const wordEls = headingRef.current?.querySelectorAll<HTMLSpanElement>("span");
        if (!wordEls || wordEls.length === 0) return;
        gsap.set(wordEls, { opacity: 0.16 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 35%",
            scrub: true,
          },
        });
        // Equal, sequential slice per word — one timeline unit each — so scrub
        // progress lights them in reading order, same as the old per-word
        // `animation-range` slices.
        wordEls.forEach((word, i) => tl.to(word, { opacity: 1, ease: "none", duration: 1 }, i));
      });
      return () => mm.revert();
    },
    { scope: headingRef },
  );

  return (
    <section className="film-grain bg-black text-white">
      <div ref={bodyRef} className="mx-auto max-w-[1100px] px-6 py-24 text-center md:py-40">
        {/* Manifesto headline: 78px, weight 300, tight (0.74) line-height. */}
        <h2
          ref={headingRef}
          className="text-[clamp(2.25rem,7vw,78px)] leading-[0.74] font-light tracking-[-0.015em]"
        >
          {words.map((word, i) => (
            <span key={i}>
              {word}
              {i < words.length - 1 && " "}
            </span>
          ))}
        </h2>
        <p className="gsap-reveal mx-auto mt-8 max-w-[620px] text-[15px] font-light text-white/65 md:text-[18px]">
          {t("body")}
        </p>
      </div>
    </section>
  );
}
