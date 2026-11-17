"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import SplitText from "@/components/SplitText";
import { gsap, useGSAP } from "@/lib/gsap";

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
 * film never starts and the poster (assembled pallet) stands in. None of this
 * video-control mechanism changed in the editorial-rebrand pass below — the video
 * itself, its sources/poster, the play/pause state and autoplay logic are exactly
 * what they were; only the cinematic layers around it are new.
 *
 * The intro choreography (letterbox retract + eyebrow/subtitle/CTA stagger) is one
 * GSAP timeline, positioned on one shared clock. The headline is no longer part of
 * that timeline — it's a <SplitText> firing on load with its own char-by-char
 * stagger, since folding per-character animation into the section timeline would
 * mean two systems fighting over the same element. A second, independent
 * ScrollTrigger (scrubbed, not timeline-based) drives the parallax + exit fade as
 * the hero scrolls past. Film grain stays pure CSS — it's an infinite ambient loop
 * on a `::after` pseudo-element, which no JS animation library can target.
 */
export function Hero() {
  const t = useTranslations("Hero");
  const tc = useTranslations("Common");
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const exitFadeRef = useRef<HTMLDivElement>(null);
  const letterboxTopRef = useRef<HTMLDivElement>(null);
  const letterboxBottomRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  // false on the server and during hydration, so the first client render matches the HTML.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const [paused, setPaused] = useState(false);
  // Off-screen the film keeps decoding 1080p frames nobody sees — stop it once
  // the hero has scrolled away and resume on the way back (unless the visitor
  // paused it). Not shown in the button state: that reflects the visitor's choice.
  const [onScreen, setOnScreen] = useState(true);
  const stopped = paused || reducedMotion;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Query the media directly: on the hydration pass `reducedMotion` is still the server value.
    if (paused || !onScreen || window.matchMedia(REDUCED_MOTION).matches) {
      video.pause();
      return;
    }
    video.play().catch(() => setPaused(true));
  }, [paused, reducedMotion, onScreen]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Intro: eyebrow → subtitle → CTA → letterbox retract, same shared clock as before.
        const tl = gsap.timeline();
        tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "motionEase" }, 0)
          .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "motionEase" }, 0.16)
          .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "motionEase" }, 0.24)
          .to(
            [letterboxTopRef.current, letterboxBottomRef.current],
            { scaleY: 0, duration: 1.6, ease: "motionEaseInOut" },
            1.2,
          );

        // Scroll-out, one scrubbed timeline over the hero's own scroll-past range
        // (one ScrollTrigger instead of three, so the layers can never drift out
        // of step): the film drifts down slower than scroll and the text exits
        // faster — a depth cue, not a pin. Over the second half the copy thins
        // out and the frame fades to black, handing off to HeroTransition on the
        // same dark surface. Timeline units: 0 → 1 = top of hero → bottom of hero.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
          })
          .to(videoLayerRef.current, { yPercent: 14, duration: 1 }, 0)
          .to(textLayerRef.current, { yPercent: -30, duration: 1 }, 0)
          .to(textLayerRef.current, { opacity: 0.2, duration: 0.4 }, 0.35)
          .to(exitFadeRef.current, { opacity: 1, duration: 0.5 }, 0.5);
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="ahsap-palet"
      className="film-grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-editorial-ink px-6 pt-[120px] pb-20 text-white"
    >
      {/* Oversized so a vertical parallax shift never exposes an edge — the
          section's own `overflow-hidden` clips anything beyond its bounds. */}
      <div ref={videoLayerRef} className="absolute inset-x-0 -top-[10%] h-[120%]">
        <video
          ref={videoRef}
          // Portrait crops keep the stamped middle block (≈68% across the frame) in shot.
          className="h-full w-full object-cover object-[65%_center] md:object-center"
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
      </div>

      {/* Cinematic grade — sage → amber → oxblood. Hero media only; this
          gradient never appears as a UI color anywhere else on the site. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--editorial-sage) 0%, var(--editorial-amber) 52%, var(--editorial-oxblood) 100%)",
        }}
      />

      {/* Darkening: heavier at top (nav + headline) and bottom (hand-off to the next section). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_38%,rgba(0,0,0,0.55)_70%,var(--editorial-ink)_100%)]"
      />
      <div ref={letterboxTopRef} aria-hidden className="letterbox letterbox-top" />
      <div ref={letterboxBottomRef} aria-hidden className="letterbox letterbox-bottom" />

      <div ref={textLayerRef} className="relative z-20 mx-auto max-w-[1078px] text-center">
        <p
          ref={eyebrowRef}
          className="gsap-reveal text-micro font-normal tracking-[0.3em] text-white/70 uppercase"
        >
          Akçay Palet
        </p>
        <SplitText
          text={t("title")}
          tag="h1"
          trigger="load"
          splitType="chars"
          delay={30}
          duration={1.1}
          effect="rise"
          className="mt-4 text-mega leading-[0.74] font-normal tracking-[-0.02em] text-white"
        />
        <p
          ref={subtitleRef}
          className="gsap-reveal mx-auto mt-6 max-w-[560px] text-md font-light text-white/80 lg:text-lead"
        >
          {t("subtitle")}
        </p>
        <div
          ref={ctaRef}
          className="gsap-reveal mt-8 flex flex-wrap items-center justify-center gap-3 text-body font-medium"
        >
          <a
            href="#iletisim"
            className="rounded-pill bg-white px-6 py-3 text-black transition duration-200 hover:bg-white/90 active:scale-[0.97]"
          >
            {tc("quote")}
          </a>
          <a
            href="#uretim-sureci"
            className="rounded-pill border border-white/35 px-6 py-3 text-white transition duration-200 hover:border-white/60 hover:bg-white/10 active:scale-[0.97]"
          >
            {tc("explore")}
          </a>
        </div>
      </div>

      {/* Cinematic hand-off overlay — see the ScrollTrigger above. */}
      <div ref={exitFadeRef} aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0" />

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
