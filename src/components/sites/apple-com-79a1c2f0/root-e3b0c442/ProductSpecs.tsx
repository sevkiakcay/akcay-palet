"use client";

import { useTranslations } from "next-intl";
import SplitText from "@/components/SplitText";
import { useEditorialReveal } from "@/hooks/use-editorial-reveal";
import { useFrameOpenReveal } from "@/hooks/use-frame-open-reveal";
import { CtaArrow } from "../shared/CtaArrow";

type SpecRow = { product: string; size: string; heat: string; use: string };

/**
 * Post-hero "can they make what I need?" answer — a technical specification
 * table instead of six identical cards, so it reads as an industrial
 * capability sheet rather than a generic feature-grid.
 */
export function ProductSpecs() {
  const t = useTranslations("Products");
  const tc = useTranslations("Common");
  const rows = t.raw("rows") as SpecRow[];
  const sectionRef = useFrameOpenReveal();
  const bodyRef = useEditorialReveal();

  return (
    <section ref={sectionRef} id="urunler" className="frame-closed bg-white px-4 py-16 text-black md:px-6 md:py-24">
      <div ref={bodyRef} className="mx-auto max-w-[1078px]">
        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12">
          <div>
            <p className="gsap-reveal text-[12px] font-normal tracking-[0.2em] text-editorial-gray-2 uppercase">
              {t("eyebrow")}
            </p>
            <SplitText
              text={t("title")}
              tag="h2"
              splitType="words"
              delay={40}
              duration={0.9}
              effect="rise"
              className="mt-3 text-[29px] leading-[1.02] font-normal tracking-[-0.015em] md:text-[38px]"
            />
            <p className="gsap-reveal mt-4 text-[15px] leading-relaxed text-editorial-gray-2">{t("body")}</p>
            <a
              href="#iletisim"
              className="gsap-reveal group mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-black underline-offset-4 hover:underline"
            >
              {tc("quote")}
              <CtaArrow />
            </a>
          </div>

          {/* Desktop: full spec table. Mobile: stacked rows — a horizontally-scrolled
              table with no scroll affordance is a poor fit for a phone screen. */}
          <table className="hidden w-full border-collapse text-start text-[14px] md:table">
            <thead>
              <tr className="border-b border-black/10 text-[11px] tracking-[0.08em] text-editorial-gray-3 uppercase">
                <th className="py-3 ps-2 pe-4 text-start font-medium">{t("cols.product")}</th>
                <th className="py-3 pe-4 text-start font-medium">{t("cols.size")}</th>
                <th className="py-3 pe-4 text-start font-medium">{t("cols.heat")}</th>
                <th className="py-3 pe-2 text-start font-medium">{t("cols.use")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="gsap-reveal border-b border-black/10 text-black transition-colors duration-200 hover:bg-black/[0.03]"
                >
                  <td className="py-3.5 ps-2 pe-4 font-medium whitespace-nowrap">{row.product}</td>
                  <td className="py-3.5 pe-4 font-mono text-[13px] whitespace-nowrap [font-variant-numeric:tabular-nums]">
                    {row.size}
                  </td>
                  <td className="py-3.5 pe-4 whitespace-nowrap text-editorial-gray-2">{row.heat}</td>
                  <td className="py-3.5 pe-2 text-editorial-gray-2">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-black/10 md:hidden">
            {rows.map((row, i) => (
              <div key={i} className="gsap-reveal py-4 first:pt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium text-black">{row.product}</p>
                  <p className="font-mono text-[13px] text-editorial-gray-2 [font-variant-numeric:tabular-nums]">
                    {row.size}
                  </p>
                </div>
                <p className="mt-1 text-[13px] text-editorial-gray-2">
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
