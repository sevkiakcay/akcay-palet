"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

const VIDEO_BASE = "/cinematic/hero";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Full-bleed intro: the pallet assembly film (middle block stamped TR · HT · AKÇAY)
 * loops muted behind the headline, darkened so the copy always reads. Phones get a
 * 720p encode, larger screens 1080p (picked by <source media>). A pause control
 * satisfies WCAG 2.2.2 for auto-playing motion; under `prefers-reduced-motion` the
 * film never starts and the poster (assembled pallet) stands in.
 */
export function Hero() {
  const t = useTranslations("Hero");
  const tc = useTranslations("Common");
  const videoRef = useRef<HTMLVideoElement>(null);
  // false on the server and during hydration, so the first client render matches the HTML.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const [paused, setPaused] = useState(false);
  const stopped = paused || reducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Query the media directly: on the hydration pass `reducedMotion` is still the server value.
    if (paused || window.matchMedia(REDUCED_MOTION).matches) {
      video.pause();
      return;
    }
    video.play().catch(() => setPaused(true));
  }, [paused, reducedMotion]);

  return (
    <section
      id="ahsap-palet"
      className="film-grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-surface-dark px-6 pt-[120px] pb-20 text-surface-dark-foreground"
    >
      <video
        ref={videoRef}
        // Portrait crops keep the stamped middle block (≈68% across the frame) in shot.
        className="absolute inset-0 h-full w-full object-cover object-[65%_center] md:object-center"
        poster={`${VIDEO_BASE}/hero-poster.webp`}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        tabIndex={-1}
      >
        <source media="(min-width: 768px)" src={`${VIDEO_BASE}/hero-1080.mp4`} type="video/mp4" />
        <source src={`${VIDEO_BASE}/hero-720.mp4`} type="video/mp4" />
      </video>

      {/* Darkening: heavier at top (nav + headline) and bottom (hand-off to the next section). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,6,0.78)_0%,rgba(10,8,6,0.45)_38%,rgba(10,8,6,0.55)_70%,var(--surface-dark)_100%)]"
      />
      <div aria-hidden className="letterbox letterbox-top" />
      <div aria-hidden className="letterbox letterbox-bottom" />

      <div className="relative z-20 mx-auto max-w-[880px] text-center">
        <p className="reveal text-[11px] font-semibold tracking-[0.28em] text-surface-dark-foreground/70 uppercase">
          Akçay Palet
        </p>
        <h1
          className="reveal font-heading mt-4 text-[40px] leading-[1.02] font-bold tracking-[-0.025em] [text-shadow:0_2px_30px_rgba(0,0,0,0.45)] sm:text-[56px] lg:text-[80px]"
          style={{ animationDelay: "80ms" }}
        >
          {t("title")}
        </h1>
        <p
          className="reveal mx-auto mt-4 max-w-[560px] text-[16px] text-surface-dark-foreground/85 lg:text-[19px]"
          style={{ animationDelay: "160ms" }}
        >
          {t("subtitle")}
        </p>
        <div
          className="reveal mt-8 flex flex-wrap items-center justify-center gap-3 text-[15px] font-medium"
          style={{ animationDelay: "240ms" }}
        >
          <a
            href="#iletisim"
            className="rounded-full bg-primary px-6 py-3 text-primary-foreground transition duration-200 hover:bg-primary/90 active:scale-[0.97]"
          >
            {tc("quote")}
          </a>
          <a
            href="#uretim-sureci"
            className="rounded-full border border-surface-dark-foreground/35 bg-black/20 px-6 py-3 text-surface-dark-foreground backdrop-blur-sm transition duration-200 hover:border-surface-dark-foreground/60 hover:bg-surface-dark-foreground/10 active:scale-[0.97]"
          >
            {tc("explore")}
          </a>
        </div>
      </div>

      {!reducedMotion && (
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-label={stopped ? t("play") : t("pause")}
          aria-pressed={paused}
          className="absolute end-4 bottom-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition duration-200 hover:bg-black/65 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
            {stopped ? <path d="M8 5.5v13l11-6.5-11-6.5Z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
          </svg>
        </button>
      )}
    </section>
  );
}
