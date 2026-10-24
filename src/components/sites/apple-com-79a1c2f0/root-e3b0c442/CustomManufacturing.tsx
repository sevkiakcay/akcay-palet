import { useTranslations } from "next-intl";
import { stagger } from "@/lib/motion";
import { CtaArrow } from "../shared/CtaArrow";
import { Reveal } from "../shared/Reveal";

type Requirement = { label: string; desc: string };

/**
 * Custom manufacturing gets its own dedicated, confident section instead of
 * being one tile among six — it's the highest-leverage business message on
 * the page (standard sizes are commoditized; custom capability is not).
 */
export function CustomManufacturing() {
  const t = useTranslations("Custom");
  const requirements = t.raw("requirements") as Requirement[];

  return (
    <section id="ozel-uretim" className="bg-surface-alt px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-[1024px] gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <p className="reveal-item text-[12px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {t("eyebrow")}
          </p>
          <h2
            className="reveal-item font-heading mt-3 text-[33px] leading-[1.06] font-semibold tracking-[-0.015em] text-foreground md:text-[46px]"
            style={stagger(1)}
          >
            {t("title")}
          </h2>
          <p className="reveal-item mt-4 max-w-[440px] text-[15px] leading-relaxed text-muted-foreground" style={stagger(2)}>
            {t("body")}
          </p>
          <a
            href="#iletisim"
            className="reveal-item group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 active:scale-[0.97]"
            style={stagger(3)}
          >
            {t("cta")}
            <CtaArrow />
          </a>
        </Reveal>

        {/* Each requirement — and its divider — fills in like lines on a spec sheet. */}
        <Reveal as="ol" className="flex flex-col divide-y divide-border">
          {requirements.map((req, i) => (
            <li key={i} className="reveal-item flex gap-4 py-4 first:pt-0 last:pb-0" style={stagger(i + 1)}>
              <span className="font-mono text-[13px] text-primary tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-[15px] font-medium text-foreground">{req.label}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{req.desc}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
