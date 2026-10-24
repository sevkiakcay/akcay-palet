import Image from "next/image";
import { useTranslations } from "next-intl";
import { PALLET_FRAME_COUNT, palletFrameUrl } from "@/lib/cinematic/pallet-sequence";

/**
 * `prefers-reduced-motion` hero — no scrub, no scroll-jacking. Shows the
 * strongest completed-pallet Google Flow frame (the last one, fully
 * assembled) as a static poster. All copy and both CTAs are immediately
 * present and accessible, same as the cinematic version's opening state.
 */
export function HeroFlowPoster() {
  const t = useTranslations("Hero");
  const tc = useTranslations("Common");
  return (
    <section
      id="ahsap-palet"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-dark text-surface-dark-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 18%, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1024px] flex-col items-center px-6 py-24 text-center">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-surface-dark-foreground/50 uppercase">
          Akçay Palet
        </p>
        <h1 className="font-heading mt-5 max-w-[820px] text-[36px] leading-[1.04] font-bold tracking-[-0.02em] md:text-[62px]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-[540px] text-[15px] text-surface-dark-foreground/65 md:text-[18px]">
          {t("subtitle")}
        </p>
        <div className="mt-7 flex items-center justify-center gap-4 text-[15px] font-medium">
          <a
            href="#iletisim"
            className="rounded-full bg-primary px-5 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {tc("quote")}
          </a>
          <a
            href="#uretim-sureci"
            className="rounded-full border border-surface-dark-foreground/25 px-5 py-2 text-surface-dark-foreground transition-colors hover:bg-surface-dark-foreground/10"
          >
            {tc("explore")}
          </a>
        </div>

        <div className="relative mt-12 aspect-video w-full max-w-[900px] overflow-hidden rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
          <Image
            src={palletFrameUrl(PALLET_FRAME_COUNT)}
            alt={t("posterAlt")}
            fill
            priority
            sizes="(min-width: 900px) 900px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
