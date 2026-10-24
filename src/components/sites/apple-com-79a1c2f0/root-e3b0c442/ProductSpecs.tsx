import { useTranslations } from "next-intl";
import { stagger } from "@/lib/motion";
import { CtaArrow } from "../shared/CtaArrow";
import { Reveal } from "../shared/Reveal";

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

  return (
    <section id="urunler" className="bg-background px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1024px]">
        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12">
          <Reveal>
            <p className="reveal-item text-[12px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {t("eyebrow")}
            </p>
            <h2
              className="reveal-item font-heading mt-3 text-[29px] leading-[1.08] font-semibold tracking-[-0.015em] text-foreground md:text-[38px]"
              style={stagger(1)}
            >
              {t("title")}
            </h2>
            <p className="reveal-item mt-4 text-[15px] leading-relaxed text-muted-foreground" style={stagger(2)}>
              {t("body")}
            </p>
            <a
              href="#iletisim"
              className="reveal-item group mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-primary underline-offset-4 hover:underline"
              style={stagger(3)}
            >
              {tc("quote")}
              <CtaArrow />
            </a>
          </Reveal>

          {/* Desktop: full spec table. Mobile: stacked rows — a horizontally-scrolled
              table with no scroll affordance is a poor fit for a phone screen. */}
          <table className="hidden w-full border-collapse text-start text-[14px] md:table">
            <thead>
              <tr className="border-b border-border text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                <th className="py-3 ps-2 pe-4 text-start font-medium">{t("cols.product")}</th>
                <th className="py-3 pe-4 text-start font-medium">{t("cols.size")}</th>
                <th className="py-3 pe-4 text-start font-medium">{t("cols.heat")}</th>
                <th className="py-3 pe-2 text-start font-medium">{t("cols.use")}</th>
              </tr>
            </thead>
            <Reveal as="tbody" className="[--stagger:60ms]">
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="reveal-item border-b border-border/60 text-foreground transition-colors duration-200 hover:bg-foreground/[0.03]"
                  style={stagger(i + 2)}
                >
                  <td className="py-3.5 ps-2 pe-4 font-medium whitespace-nowrap">{row.product}</td>
                  <td className="py-3.5 pe-4 font-mono text-[13px] whitespace-nowrap [font-variant-numeric:tabular-nums]">
                    {row.size}
                  </td>
                  <td className="py-3.5 pe-4 whitespace-nowrap text-muted-foreground">{row.heat}</td>
                  <td className="py-3.5 pe-2 text-muted-foreground">{row.use}</td>
                </tr>
              ))}
            </Reveal>
          </table>

          <Reveal className="divide-y divide-border md:hidden">
            {rows.map((row, i) => (
              <div key={i} className="reveal-item py-4 first:pt-0" style={stagger(i)}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium text-foreground">{row.product}</p>
                  <p className="font-mono text-[13px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                    {row.size}
                  </p>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {row.heat} — {row.use}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
