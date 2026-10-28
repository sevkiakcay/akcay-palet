import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { stagger } from "@/lib/motion";
import { Reveal } from "../shared/Reveal";

/**
 * The bridge from the video hero into the rest of the site: one oversized
 * statement whose words light up in reading order as it crosses the viewport
 * (CSS scroll-driven, no pinning), on the same dark, grained surface as the hero.
 */
export function HeroTransition() {
  const t = useTranslations("Transition");
  const words = t("title").split(" ");
  // Each word gets its own slice of the heading's pass through the viewport.
  const span = 30 / words.length;

  return (
    <section className="film-grain bg-surface-dark text-surface-dark-foreground">
      <div className="mx-auto max-w-[1100px] px-6 py-24 text-center md:py-40">
        <h2 className="scroll-words font-heading text-[40px] leading-[1.02] font-semibold tracking-[-0.03em] sm:text-[60px] md:text-[96px]">
          {words.map((word, i) => (
            <span
              key={i}
              style={{ "--word-range": `cover ${18 + i * span}% cover ${18 + (i + 1) * span}%` } as CSSProperties}
            >
              {word}
              {i < words.length - 1 && " "}
            </span>
          ))}
        </h2>
        <Reveal>
          <p
            className="reveal-item mx-auto mt-8 max-w-[620px] text-[15px] text-surface-dark-foreground/65 md:text-[18px]"
            style={stagger(1)}
          >
            {t("body")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
