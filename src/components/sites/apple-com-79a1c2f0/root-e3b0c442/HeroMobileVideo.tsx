import { useTranslations } from "next-intl";
import { PALLET_FRAME_COUNT, palletFrameUrl } from "@/lib/cinematic/pallet-sequence";

/**
 * Mobile/touch hero — the same Google Flow assembly shot as the desktop
 * 240-frame sequence, but delivered as a single compressed, silent,
 * autoplay-once video (~270KB) instead of a scroll-scrubbed frame set.
 * Lighter than progressively loading dozens of individual frames on a
 * mobile connection, and avoids asking a touch user to scroll-scrub a
 * frame sequence — a poor fit for touch. No scroll-jacking, no pin: the
 * video just plays once as the hero enters view, then holds on its last
 * (fully-assembled) frame. CTA and copy are plain HTML, always accessible
 * even if the video fails to load (the poster frame — the same final Flow
 * frame used by the reduced-motion poster — still shows).
 */
export function HeroMobileVideo() {
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

      <div className="relative z-10 mx-auto flex max-w-[1024px] flex-col items-center px-6 py-20 text-center">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-surface-dark-foreground/50 uppercase">
          Akçay Palet
        </p>
        <h1 className="font-heading mt-5 max-w-[820px] text-[33px] leading-[1.05] font-bold tracking-[-0.02em]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-[520px] text-[15px] text-surface-dark-foreground/65">
          {t("subtitle")}
        </p>
        <div className="mt-7 flex items-center justify-center gap-3 text-[15px] font-medium">
          <a
            href="#iletisim"
            className="rounded-full bg-primary px-5 py-2.5 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {tc("quote")}
          </a>
          <a
            href="#uretim-sureci"
            className="rounded-full border border-surface-dark-foreground/25 px-5 py-2.5 text-surface-dark-foreground transition-colors hover:bg-surface-dark-foreground/10"
          >
            {tc("explore")}
          </a>
        </div>

        <div className="relative mt-10 aspect-video w-full max-w-[640px] overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
          <video
            className="h-full w-full object-cover"
            poster={palletFrameUrl(PALLET_FRAME_COUNT)}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-label={t("canvasLabel")}
          >
            <source src="/cinematic/pallet/video/flow-1-mobile.webm" type="video/webm" />
            <source src="/cinematic/pallet/video/flow-1-mobile.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
