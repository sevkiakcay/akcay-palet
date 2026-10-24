"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { PALLET_FRAME_COUNT, palletFrameUrl } from "@/lib/cinematic/pallet-sequence";

const VIDEO_BASE = "/cinematic/pallet/video";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Intro video hero: the Google Flow pallet-assembly shot plays once, muted,
 * as the first thing a visitor sees, then holds on the assembled pallet.
 * Server-rendered as a plain <video> with the first frame as poster, so there
 * is no placeholder swap on hydration. Desktop gets a 1280×720 encode, phones
 * the lighter 1080×608 one (picked by the browser via <source media>).
 * Under `prefers-reduced-motion` the video never plays — the poster switches
 * to the final, fully-assembled frame instead.
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
  const [playbackDone, setPlaybackDone] = useState(false);
  // Reduced-motion visitors start on the end state; pressing replay is their opt-in to watch.
  const [userPlaying, setUserPlaying] = useState(false);
  const ended = playbackDone || (reducedMotion && !userPlaying);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Query the media directly: on the hydration pass `reducedMotion` is still the server
    // value (false), and starting playback then would move the video for these visitors.
    if (window.matchMedia(REDUCED_MOTION).matches) {
      video.pause();
      return;
    }
    // Started here rather than via the autoplay attribute so reduced-motion
    // visitors never see a frame of movement. Muted + playsInline is allowed everywhere.
    video.play().catch(() => setPlaybackDone(true));
  }, [reducedMotion]);

  function replay() {
    const video = videoRef.current;
    if (!video) return;
    setPlaybackDone(false);
    setUserPlaying(true);
    video.currentTime = 0;
    video.play().catch(() => setPlaybackDone(true));
  }

  return (
    <section
      id="ahsap-palet"
      className="relative flex flex-col items-center overflow-hidden bg-surface-dark px-6 pt-[132px] pb-16 text-surface-dark-foreground lg:min-h-[100svh] lg:justify-center lg:pt-[100px] lg:pb-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 18%, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-20 mx-auto max-w-[820px] text-center">
        <p className="reveal text-[11px] font-semibold tracking-[0.28em] text-surface-dark-foreground/50 uppercase">
          Akçay Palet
        </p>
        <h1
          className="reveal font-heading mt-4 text-[34px] leading-[1.05] font-bold tracking-[-0.02em] sm:text-[44px] lg:text-[56px]"
          style={{ animationDelay: "80ms" }}
        >
          {t("title")}
        </h1>
        <p
          className="reveal mx-auto mt-3 max-w-[560px] text-[15px] text-surface-dark-foreground/70 lg:text-[18px]"
          style={{ animationDelay: "160ms" }}
        >
          {t("subtitle")}
        </p>
        <div
          className="reveal mt-6 flex flex-wrap items-center justify-center gap-3 text-[15px] font-medium"
          style={{ animationDelay: "240ms" }}
        >
          <a
            href="#iletisim"
            className="rounded-full bg-primary px-5 py-2.5 text-primary-foreground transition duration-200 hover:bg-primary/90 active:scale-[0.97]"
          >
            {tc("quote")}
          </a>
          <a
            href="#uretim-sureci"
            className="rounded-full border border-surface-dark-foreground/25 px-5 py-2.5 text-surface-dark-foreground transition duration-200 hover:border-surface-dark-foreground/45 hover:bg-surface-dark-foreground/10 active:scale-[0.97]"
          >
            {tc("explore")}
          </a>
        </div>
      </div>

      {/* Height-capped on desktop so copy + video always fit one viewport. */}
      <div className="relative z-10 mt-9 aspect-video w-full max-w-[640px] overflow-hidden rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] lg:h-[min(54vh,562px)] lg:w-auto lg:max-w-full">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster={palletFrameUrl(reducedMotion ? PALLET_FRAME_COUNT : 1)}
          muted
          playsInline
          preload="auto"
          onEnded={() => {
            setPlaybackDone(true);
            setUserPlaying(false);
          }}
          aria-label={t("canvasLabel")}
        >
          <source media="(min-width: 1024px)" src={`${VIDEO_BASE}/flow-1-desktop.webm`} type="video/webm" />
          <source media="(min-width: 1024px)" src={`${VIDEO_BASE}/flow-1-desktop.mp4`} type="video/mp4" />
          <source src={`${VIDEO_BASE}/flow-1-mobile.webm`} type="video/webm" />
          <source src={`${VIDEO_BASE}/flow-1-mobile.mp4`} type="video/mp4" />
        </video>

        {/* Blueprint-style spec callouts once the pallet is assembled — desktop only, too small on phones. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 hidden transition-opacity duration-700 md:block ${ended ? "opacity-100" : "opacity-0"}`}
        >
          <span className="absolute start-[4%] top-[8%] border-s border-white/30 ps-3 text-[11px] tracking-wide text-white/75">
            {t("annotations.size")}
          </span>
          <span className="absolute end-[4%] top-[8%] border-e border-white/30 pe-3 text-end text-[11px] tracking-wide text-white/75">
            {t("annotations.export")}
          </span>
          <span className="absolute start-[4%] bottom-[8%] border-s border-white/30 ps-3 text-[11px] tracking-wide text-white/75">
            {t("annotations.heat")}
          </span>
          <span className="absolute end-[4%] bottom-[8%] border-e border-white/30 pe-3 text-end text-[11px] tracking-wide text-white/75">
            {t("annotations.custom")}
          </span>
        </div>

        {/* Corner on phones, where the centred spot would cover the pallet; centred between
            the callouts on larger screens. A flex row keeps "end" correct in RTL. */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end md:justify-center">
          <button
            type="button"
            onClick={replay}
            aria-label={t("replay")}
            tabIndex={ended ? 0 : -1}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition duration-500 hover:bg-black/70 active:scale-95 ${ended ? "pointer-events-auto opacity-100" : "opacity-0"}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                d="M4 12a8 8 0 1 0 2.34-5.66M4 4v4h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
