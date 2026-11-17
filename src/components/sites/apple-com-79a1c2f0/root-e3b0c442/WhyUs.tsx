"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Pillar = { title: string; desc: string };

export function WhyUs() {
  const t = useTranslations("Why");
  const pillars = t.raw("pillars") as Pillar[];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-why-title]", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%" },
      });

      gsap.from("[data-why-pillar]", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: "[data-why-grid]", start: "top 80%" },
      });

      gsap.from("[data-why-accent]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.8,
        ease: "power2.inOut",
        stagger: 0.15,
        scrollTrigger: { trigger: "[data-why-grid]", start: "top 78%" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="neden-akcay" className="bg-surface-alt px-6 py-28 md:py-40">
      <div className="mx-auto max-w-[1100px]">
        <h2
          data-why-title
          className="font-heading text-[clamp(29px,5vw,48px)] leading-[1.08] font-semibold tracking-[-0.02em] text-foreground"
        >
          {t("title")}
        </h2>

        <div data-why-grid className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-10 md:mt-20">
          {pillars.map((pillar) => (
            <div key={pillar.title} data-why-pillar className="relative border-t border-border pt-7">
              <span data-why-accent aria-hidden className="absolute start-0 -top-px h-px w-14 bg-primary" />
              <h3 className="text-[17px] font-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
