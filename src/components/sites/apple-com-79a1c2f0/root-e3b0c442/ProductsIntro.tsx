"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitText from "@/components/SplitText";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Top of the dedicated products page — dark like the home hero, but compact:
 * the spec table below is the content.
 *
 * The eyebrow/subtitle/CTA stagger is one gsap.timeline() (absolute
 * 0/160/240ms positions, same `.gsap-reveal` starting pose as Hero.tsx). The
 * title is a <SplitText trigger="load">, same treatment as the home hero's
 * headline, for the same reason it isn't part of the timeline there either.
 */
export function ProductsIntro() {
  const t = useTranslations("ProductsPage");
  const tc = useTranslations("Common");
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "motionEase" }, 0)
          .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "motionEase" }, 0.16)
          .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "motionEase" }, 0.24);
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="film-grain light-sweep relative overflow-hidden bg-black px-6 pt-[150px] pb-20 text-white md:pt-[180px] md:pb-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 70% at 50% 0%, rgb(255 255 255 / 0.12) 0%, transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-[760px] text-center">
        <p
          ref={eyebrowRef}
          className="gsap-reveal text-[11px] font-normal tracking-[0.28em] text-white/55 uppercase"
        >
          {t("eyebrow")}
        </p>
        <SplitText
          text={t("title")}
          tag="h1"
          trigger="load"
          splitType="chars"
          delay={30}
          duration={1.0}
          effect="rise"
          className="mt-4 text-[clamp(2.25rem,8vw,96px)] leading-[0.82] font-normal tracking-[-0.02em] text-white"
        />
        <p
          ref={subtitleRef}
          className="gsap-reveal mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-white/70 md:text-[18px]"
        >
          {t("body")}
        </p>
        <a
          ref={ctaRef}
          href="#iletisim"
          className="gsap-reveal mt-7 inline-flex rounded-pill bg-white px-6 py-2.5 text-[15px] font-medium text-black transition duration-200 hover:bg-white/90 active:scale-[0.97]"
        >
          {tc("quote")}
        </a>
      </div>
    </section>
  );
}
