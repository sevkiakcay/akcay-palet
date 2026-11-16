"use client";

import { useTranslations } from "next-intl";
import SplitText from "@/components/SplitText";
import { useEditorialReveal } from "@/hooks/use-editorial-reveal";
import { useFrameOpenReveal } from "@/hooks/use-frame-open-reveal";

type Pillar = { title: string; desc: string };

/**
 * Three reasons laid out like a spec sheet — hairline rules with a tick at
 * the start of each — rather than centred blurbs, matching the product
 * table's technical voice.
 */
export function WhyUs() {
  const t = useTranslations("Why");
  const pillars = t.raw("pillars") as Pillar[];
  const sectionRef = useFrameOpenReveal();
  const bodyRef = useEditorialReveal();

  return (
    <section ref={sectionRef} id="neden-akcay" className="frame-closed bg-white px-6 py-20 text-black md:py-28">
      <div ref={bodyRef} className="mx-auto max-w-[1078px]">
        <SplitText
          text={t("title")}
          tag="h2"
          splitType="words"
          delay={40}
          duration={0.9}
          effect="rise"
          className="text-[29px] leading-[1.05] font-normal tracking-[-0.015em] md:text-[42px]"
        />
        <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8 md:mt-14">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="gsap-reveal relative border-t border-black/10 pt-6">
              <span aria-hidden className="absolute start-0 -top-px h-px w-12 bg-black" />
              <h3 className="text-[17px] font-medium text-black">{pillar.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-editorial-gray-2">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
