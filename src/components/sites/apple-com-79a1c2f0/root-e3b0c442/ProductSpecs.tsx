"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CtaArrow } from "../shared/CtaArrow";

gsap.registerPlugin(ScrollTrigger);

type SpecRow = { product: string; size: string; heat: string; use: string };

export function ProductSpecs() {
  const t = useTranslations("Products");
  const tc = useTranslations("Common");
  const rows = t.raw("rows") as SpecRow[];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header content
      gsap.from("[data-spec-eyebrow]", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 80%" },
      });

      gsap.from("[data-spec-title]", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%" },
      });

      gsap.from("[data-spec-body]", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 75%" },
      });

      // Table rows stagger
      gsap.from("[data-spec-row]", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-spec-table]", start: "top 80%" },
      });

      // Mobile cards stagger
      gsap.from("[data-spec-card]", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-spec-mobile]", start: "top 85%" },
      });

      // Hairline draw
      gsap.from("[data-spec-line]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: { trigger: section, start: "top 70%" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="urunler" className="bg-background px-4 py-24 md:px-6 md:py-36">
      <div className="mx-auto max-w-[1100px]">
        {/* Decorative hairline across full width */}
        <div data-spec-line className="mb-12 h-px bg-border md:mb-16" />

        <div className="grid gap-10 md:grid-cols-[minmax(0,380px)_1fr] md:gap-16">
          <div>
            <p
              data-spec-eyebrow
              className="text-[11px] font-semibold tracking-[0.25em] text-muted-foreground uppercase"
            >
              {t("eyebrow")}
            </p>
            <h2
              data-spec-title
              className="font-heading mt-4 text-[clamp(32px,5vw,52px)] leading-[1.05] font-semibold tracking-[-0.02em] text-foreground"
            >
              {t("title")}
            </h2>
            <p
              data-spec-body
              className="mt-5 text-[15px] leading-relaxed text-muted-foreground md:text-[16px]"
            >
              {t("body")}
            </p>
            <a
              href="#iletisim"
              className="group mt-8 inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-[14px] font-medium text-foreground transition duration-300 hover:border-primary hover:text-primary"
            >
              {tc("quote")}
              <CtaArrow />
            </a>
          </div>

          {/* Desktop table */}
          <table data-spec-table className="hidden w-full border-collapse text-start text-[14px] md:table">
            <thead>
              <tr className="border-b border-border text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                <th className="py-4 ps-2 pe-4 text-start font-medium">{t("cols.product")}</th>
                <th className="py-4 pe-4 text-start font-medium">{t("cols.size")}</th>
                <th className="py-4 pe-4 text-start font-medium">{t("cols.heat")}</th>
                <th className="py-4 pe-2 text-start font-medium">{t("cols.use")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  data-spec-row
                  className="border-b border-border/50 text-foreground transition-colors duration-200 hover:bg-foreground/[0.02]"
                >
                  <td className="py-4 ps-2 pe-4 font-medium whitespace-nowrap">{row.product}</td>
                  <td className="py-4 pe-4 font-mono text-[13px] whitespace-nowrap [font-variant-numeric:tabular-nums]">
                    {row.size}
                  </td>
                  <td className="py-4 pe-4 whitespace-nowrap text-muted-foreground">{row.heat}</td>
                  <td className="py-4 pe-2 text-muted-foreground">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div data-spec-mobile className="divide-y divide-border md:hidden">
            {rows.map((row, i) => (
              <div key={i} data-spec-card className="py-5 first:pt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium text-foreground">{row.product}</p>
                  <p className="font-mono text-[13px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                    {row.size}
                  </p>
                </div>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  {row.heat} — {row.use}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
