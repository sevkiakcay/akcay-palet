import { useTranslations } from "next-intl";
import { stagger } from "@/lib/motion";
import { Reveal } from "../shared/Reveal";

/**
 * The bridge from the video hero into the rest of the site. Same dark surface
 * as the hero so the handoff reads as one continuous scene, not a new page; a
 * plain scroll-reveal (ui-ux-pro-max's "Subtle" tier), no pin, no scrub.
 */
export function HeroTransition() {
  const t = useTranslations("Transition");

  return (
    <section className="bg-surface-dark text-surface-dark-foreground">
      <Reveal className="mx-auto max-w-[720px] px-6 py-20 text-center md:py-28">
        <h2 className="reveal-item font-heading text-[29px] leading-[1.1] font-semibold tracking-[-0.015em] md:text-[40px]">
          {t("title")}
        </h2>
        <p className="reveal-item mt-4 text-[15px] text-surface-dark-foreground/65 md:text-[17px]" style={stagger(1.5)}>
          {t("body")}
        </p>
      </Reveal>
    </section>
  );
}
