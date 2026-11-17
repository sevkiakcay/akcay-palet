"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_BASE = "/cinematic/hero";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function Hero() {
  const t = useTranslations("Hero");
  const tc = useTranslations("Common");
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
    if (paused || window.matchMedia(REDUCED_MOTION).matches) {
      video.pause();
      return;
    }
    video.play().catch(() => setPaused(true));
  }, [paused, reducedMotion]);

  // GSAP entrance animation
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return;
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Eyebrow
      tl.from("[data-hero-eyebrow]", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Title words stagger
      tl.from("[data-hero-title] .word", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
      }, "-=0.5");

      // Subtitle
      tl.from("[data-hero-subtitle]", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.6");

      // CTA buttons
      tl.from("[data-hero-cta] > *", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
      }, "-=0.4");

      // Parallax on scroll — content moves up faster than background
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          if (content) {
            gsap.set(content, { y: self.progress * 120 });
          }
          if (videoRef.current) {
            gsap.set(videoRef.current, { y: self.progress * 60 });
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Split title into words for stagger animation
  const titleWords = t("title").split(" ");

  return (
    <section
      ref={sectionRef}
      id="ahsap-palet"
      className="film-grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-surface-dark px-6 pt-[120px] pb-20 text-surface-dark-foreground"
    >
      <video
        ref={videoRef}
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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,6,0.78)_0%,rgba(10,8,6,0.45)_38%,rgba(10,8,6,0.55)_70%,var(--surface-dark)_100%)]"
      />
      <div aria-hidden className="letterbox letterbox-top" />
      <div aria-hidden className="letterbox letterbox-bottom" />

      <div ref={contentRef} className="relative z-20 mx-auto max-w-[960px] text-center">
        <p
          data-hero-eyebrow
          className="text-[11px] font-semibold tracking-[0.3em] text-surface-dark-foreground/60 uppercase md:text-[12px]"
        >
          Akçay Palet
        </p>
        <h1
          data-hero-title
          className="font-heading mt-5 text-[clamp(42px,8vw,100px)] leading-[0.98] font-bold tracking-[-0.03em] [text-shadow:0_2px_30px_rgba(0,0,0,0.45)]"
        >
          {titleWords.map((word, i) => (
            <span key={i} className="word inline-block">
              {word}
              {i < titleWords.length - 1 && " "}
            </span>
          ))}
        </h1>
        <p
          data-hero-subtitle
          className="mx-auto mt-5 max-w-[560px] text-[16px] leading-relaxed text-surface-dark-foreground/75 md:text-[19px]"
        >
          {t("subtitle")}
        </p>
        <div
          data-hero-cta
          className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[15px] font-medium"
        >
          <a
            href="#iletisim"
            className="rounded-full bg-primary px-7 py-3.5 text-primary-foreground transition duration-300 hover:bg-primary/90 active:scale-[0.97]"
          >
            {tc("quote")}
          </a>
          <a
            href="#uretim-sureci"
            className="rounded-full border border-surface-dark-foreground/25 bg-white/5 px-7 py-3.5 text-surface-dark-foreground backdrop-blur-sm transition duration-300 hover:border-surface-dark-foreground/50 hover:bg-white/10 active:scale-[0.97]"
          >
            {tc("explore")}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-surface-dark-foreground/20 pt-2">
          <div className="h-2 w-0.5 animate-bounce rounded-full bg-surface-dark-foreground/40" />
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
