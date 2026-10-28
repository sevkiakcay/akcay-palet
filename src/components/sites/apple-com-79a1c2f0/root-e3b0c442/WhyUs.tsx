import { useTranslations } from "next-intl";
import { stagger } from "@/lib/motion";
import { Reveal } from "../shared/Reveal";

type Pillar = { title: string; desc: string };

/**
 * Three reasons laid out like a spec sheet — hairline rules with a copper
 * tick at the start of each — rather than centred blurbs, matching the
 * product table's technical voice.
 */
export function WhyUs() {
  const t = useTranslations("Why");
  const pillars = t.raw("pillars") as Pillar[];

  return (
    <section id="neden-akcay" className="frame-open bg-surface-alt px-6 py-20 md:py-28">
      <div className="mx-auto max-w-[1024px]">
        <Reveal>
          <h2 className="reveal-item font-heading text-[29px] leading-[1.1] font-semibold tracking-[-0.015em] text-foreground md:text-[42px]">
            {t("title")}
          </h2>
        </Reveal>
        <Reveal className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8 md:mt-14">
          {pillars.map((pillar, i) => (
            <div key={pillar.title} className="reveal-item relative border-t border-border pt-6" style={stagger(i)}>
              <span aria-hidden className="draw-x absolute start-0 -top-px h-px w-12 bg-primary" style={stagger(i + 2)} />
              <h3 className="text-[17px] font-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{pillar.desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
