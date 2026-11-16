"use client";

import { useTranslations } from "next-intl";
import { CONTACT, whatsappUrl } from "@/lib/contact";
import { useEditorialReveal } from "@/hooks/use-editorial-reveal";
import { useFrameOpenReveal } from "@/hooks/use-frame-open-reveal";
import { CtaArrow } from "../shared/CtaArrow";
import { QuoteForm } from "./QuoteForm";

/** The site's actual quote-request destination — every "Teklif Al" CTA site-wide points here (#iletisim). */
export function FinalCta() {
  const t = useTranslations("Final");
  const titleLines = t.raw("titleLines") as string[];
  const quickChannels = [
    { label: "WhatsApp", value: whatsappUrl(t("whatsappMessage")) },
    { label: CONTACT.phone, value: CONTACT.phone ? `tel:${CONTACT.phone.replace(/\s/g, "")}` : null },
    { label: CONTACT.email, value: CONTACT.email ? `mailto:${CONTACT.email}` : null },
  ].filter((c): c is { label: string; value: string } => Boolean(c.label && c.value));
  const sectionRef = useFrameOpenReveal();
  const bodyRef = useEditorialReveal();

  return (
    <section
      ref={sectionRef}
      id="iletisim"
      className="frame-closed film-grain light-sweep bg-black py-24 text-center text-white md:py-32"
    >
      <div ref={bodyRef}>
        {/* Each line of the closing statement rises in turn — simple fade/rise,
            not the old masked line-slide, since these lines are pre-broken by
            translation (not auto-wrapped), so SplitText's own line-splitting
            doesn't apply cleanly here. */}
        <h2 className="mx-auto px-6 text-[40px] leading-[0.95] font-normal tracking-[-0.01em] uppercase md:text-[74px]">
          {titleLines.map((line, i) => (
            <span key={i} className="gsap-reveal block">
              {line}
            </span>
          ))}
        </h2>
        <p className="gsap-reveal mx-auto mt-6 max-w-[480px] px-6 text-[15px] text-white/60 md:text-[17px]">
          {t("body")}
        </p>

        {quickChannels.length > 0 && (
          <div className="gsap-reveal mt-8 flex flex-wrap items-center justify-center gap-3 px-6 text-[15px] font-medium">
            {quickChannels.map((channel) => (
              <a
                key={channel.label}
                href={channel.value}
                className="group inline-flex items-center gap-2 rounded-pill bg-white px-6 py-2.5 text-black transition duration-200 hover:bg-white/90 active:scale-[0.97]"
              >
                <bdi>{channel.label}</bdi>
                <CtaArrow />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="px-6">
        <QuoteForm />
      </div>
    </section>
  );
}
