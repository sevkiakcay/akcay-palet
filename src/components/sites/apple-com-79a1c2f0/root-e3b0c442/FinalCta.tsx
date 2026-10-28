import { useTranslations } from "next-intl";
import { CONTACT, whatsappUrl } from "@/lib/contact";
import { stagger } from "@/lib/motion";
import { CtaArrow } from "../shared/CtaArrow";
import { Reveal } from "../shared/Reveal";
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

  return (
    <section id="iletisim" className="frame-open film-grain light-sweep bg-surface-dark py-24 text-center text-surface-dark-foreground md:py-32">
      {/* Each word of the closing line rises from behind its own baseline, one after another. */}
      <Reveal className="[--stagger:120ms]">
        <h2 className="font-heading mx-auto px-6 text-[40px] leading-[1.03] font-bold tracking-[-0.01em] uppercase md:text-[74px]">
          {titleLines.map((line, i) => (
            <span key={i} className="reveal-line" style={stagger(i)}>
              <span>{line}</span>
            </span>
          ))}
        </h2>
        <p
          className="reveal-item mx-auto mt-6 max-w-[480px] px-6 text-[15px] text-surface-dark-foreground/60 md:text-[17px]"
          style={stagger(titleLines.length)}
        >
          {t("body")}
        </p>

        {quickChannels.length > 0 && (
          <div
            className="reveal-item mt-8 flex flex-wrap items-center justify-center gap-3 px-6 text-[15px] font-medium"
            style={stagger(titleLines.length + 1)}
          >
            {quickChannels.map((channel) => (
              <a
                key={channel.label}
                href={channel.value}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-primary-foreground transition duration-200 hover:bg-primary/90 active:scale-[0.97]"
              >
                <bdi>{channel.label}</bdi>
                <CtaArrow />
              </a>
            ))}
          </div>
        )}
      </Reveal>

      <div className="px-6">
        <QuoteForm />
      </div>
    </section>
  );
}
