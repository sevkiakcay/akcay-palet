"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useEditorialReveal } from "@/hooks/use-editorial-reveal";
import { useFrameOpenReveal } from "@/hooks/use-frame-open-reveal";
import { gsap, useGSAP } from "@/lib/gsap";

type StatItem = { value: number; suffix: string; label: string };

/**
 * Stats strip right below the hero — three headline numbers that count up
 * once as the section scrolls into view. A light band here (between the
 * hero and HeroTransition's dark manifesto) keeps the black/white
 * alternation consistent all the way down the page.
 *
 * Each number renders its real, final, locale-formatted value from the
 * first paint (SSR-safe, no-JS-safe) — the count-up only ever *starts* once
 * its own ScrollTrigger fires, via the tween's first onUpdate call, so
 * there's no eager reset-to-zero at mount that could flash or get stuck.
 * Under reduced motion the counting branch never runs at all, so the
 * number simply never changes from its correct static value.
 */
export function StatsSection() {
  const t = useTranslations("Stats");
  const locale = useLocale();
  const items = t.raw("items") as StatItem[];
  const sectionRef = useFrameOpenReveal();
  const bodyRef = useEditorialReveal();
  const numberRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const formatter = new Intl.NumberFormat(locale);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        numberRefs.current.forEach((el, i) => {
          const item = items[i];
          if (!el || !item) return;
          const counter = { val: 0 };
          gsap.to(counter, {
            val: item.value,
            duration: 2,
            ease: "editorialEase",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
              el.textContent = `${formatter.format(Math.round(counter.val))}${item.suffix}`;
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: bodyRef },
  );

  return (
    <section ref={sectionRef} className="frame-closed bg-white px-6 py-20 text-black md:py-28">
      <div ref={bodyRef} className="mx-auto max-w-[1078px]">
        <p className="gsap-reveal text-center text-[12px] font-normal tracking-[0.2em] text-editorial-gray-2 uppercase">
          {t("eyebrow")}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          {items.map((item, i) => (
            <div key={item.label} className="gsap-reveal text-center">
              <p
                ref={(el) => {
                  numberRefs.current[i] = el;
                }}
                className="text-[clamp(2.5rem,6vw,72px)] leading-none font-normal tracking-[-0.02em] tabular-nums"
              >
                {formatter.format(item.value)}
                {item.suffix}
              </p>
              <p className="mt-3 text-[13px] font-normal tracking-[0.05em] text-editorial-gray-2 uppercase">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
