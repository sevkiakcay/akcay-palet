"use client";

import { useTranslations } from "next-intl";
import SplitText from "@/components/SplitText";
import { useEditorialReveal } from "@/hooks/use-editorial-reveal";
import { useFrameOpenReveal } from "@/hooks/use-frame-open-reveal";
import { CtaArrow } from "../shared/CtaArrow";

type Requirement = { label: string; desc: string };

/**
 * Custom manufacturing gets its own dedicated, confident section instead of
 * being one tile among six — it's the highest-leverage business message on
 * the page (standard sizes are commoditized; custom capability is not).
 */
export function CustomManufacturing() {
  const t = useTranslations("Custom");
  const requirements = t.raw("requirements") as Requirement[];
  const sectionRef = useFrameOpenReveal();
  const bodyRef = useEditorialReveal();

  return (
    <section
      ref={sectionRef}
      id="ozel-uretim"
      className="frame-closed bg-white px-4 py-16 text-black md:px-6 md:py-24"
    >
      <div ref={bodyRef} className="mx-auto grid max-w-[1078px] gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <p className="gsap-reveal text-caption font-normal tracking-[0.2em] text-editorial-gray-2 uppercase">
            {t("eyebrow")}
          </p>
          <SplitText
            textAlign="start"
            text={t("title")}
            tag="h2"
            splitType="words"
            delay={40}
            duration={0.9}
            effect="rise"
            className="mt-3 text-section leading-[1.0] font-normal tracking-[-0.015em]"
          />
          <p className="gsap-reveal mt-4 max-w-[440px] text-body leading-relaxed text-editorial-gray-2">
            {t("body")}
          </p>
          <a
            href="#iletisim"
            className="gsap-reveal group mt-6 inline-flex items-center gap-2 rounded-pill bg-black px-6 py-2.5 text-ui font-semibold text-white transition duration-200 hover:bg-black/85 active:scale-[0.97]"
          >
            {t("cta")}
            <CtaArrow />
          </a>
        </div>

        {/* Each requirement — and its divider — fills in like lines on a spec sheet. */}
        <ol className="flex flex-col divide-y divide-black/10">
          {requirements.map((req, i) => (
            <li key={i} className="gsap-reveal flex gap-4 py-4 first:pt-0 last:pb-0">
              <span className="font-mono text-small text-editorial-gray-2 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-body font-medium text-black">{req.label}</p>
                <p className="mt-0.5 text-small text-editorial-gray-2">{req.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
