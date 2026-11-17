"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CtaArrow } from "../shared/CtaArrow";

gsap.registerPlugin(ScrollTrigger);

type Requirement = { label: string; desc: string };

export function CustomManufacturing() {
  const t = useTranslations("Custom");
  const requirements = t.raw("requirements") as Requirement[];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Left column stagger
      gsap.from("[data-custom-left] > *", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: "top 75%" },
      });

      // Requirements list items stagger
      gsap.from("[data-custom-item]", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-custom-list]", start: "top 80%" },
      });

      // Hairline draw for each divider
      gsap.from("[data-custom-list] .divide-y > * + *::before", {
        scaleX: 0,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="ozel-uretim" className="bg-surface-alt px-4 py-24 md:px-6 md:py-36">
      <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-2 md:gap-20">
        <div data-custom-left>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="font-heading mt-4 text-[clamp(33px,5vw,52px)] leading-[1.04] font-semibold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-muted-foreground md:text-[16px]">
            {t("body")}
          </p>
          <a
            href="#iletisim"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-[14px] font-semibold text-primary-foreground transition duration-300 hover:bg-primary/90 active:scale-[0.97]"
          >
            {t("cta")}
            <CtaArrow />
          </a>
        </div>

        <ol data-custom-list className="flex flex-col divide-y divide-border">
          {requirements.map((req, i) => (
            <li key={i} data-custom-item className="flex gap-5 py-5 first:pt-0 last:pb-0">
              <span className="font-mono text-[14px] font-medium text-primary tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">{req.label}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{req.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
