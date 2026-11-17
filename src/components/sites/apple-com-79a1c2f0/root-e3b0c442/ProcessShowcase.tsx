"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Step = { title: string; desc: string };

export function ProcessShowcase() {
  const t = useTranslations("Process");
  const steps = t.raw("steps") as Step[];
  const checkpoints = t.raw("checkpoints") as string[];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from("[data-process-header] > *", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: "top 78%" },
      });

      // Timeline line draw
      gsap.from("[data-process-line]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.5,
        ease: "power2.inOut",
        scrollTrigger: { trigger: "[data-process-steps]", start: "top 75%" },
      });

      // Steps stagger — delayed to follow the line
      gsap.from("[data-process-step]", {
        y: 30,
        opacity: 0,
        scale: 0.95,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: { trigger: "[data-process-steps]", start: "top 72%" },
      });

      // Checkpoints
      gsap.from("[data-process-checkpoints] > *", {
        y: 15,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: "[data-process-checkpoints]", start: "top 85%" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="uretim-sureci" className="film-grain bg-surface-dark py-28 text-surface-dark-foreground md:py-40">
      <div data-process-header className="px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-surface-dark-foreground/50 uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="font-heading mt-4 text-[clamp(31px,5.5vw,52px)] font-semibold tracking-[-0.02em]">
          {t("title")}
        </h2>
      </div>

      <div className="mx-auto mt-20 max-w-[1100px] px-6 md:mt-24">
        <div data-process-steps className="relative grid gap-x-8 gap-y-14 sm:grid-cols-3">
          {/* Connecting line across the track */}
          <div
            aria-hidden
            className="absolute top-[14px] right-[16.5%] left-[16.5%] hidden h-px bg-surface-dark-foreground/12 sm:block"
          >
            <div data-process-line className="h-full bg-primary/60" />
          </div>

          {steps.map((step, i) => (
            <div key={i} data-process-step className="relative text-center">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-surface-dark ring-1 ring-surface-dark-foreground/20">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <p className="mt-5 font-mono text-[13px] tracking-widest text-primary-bright">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1.5 text-[17px] font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2.5 max-w-[260px] text-[14px] leading-relaxed text-surface-dark-foreground/55">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-[1100px] px-6 md:mt-28">
        <div className="h-px w-full bg-surface-dark-foreground/10" />
        <div className="mt-8 text-center">
          <p className="text-[11px] font-medium tracking-[0.15em] text-surface-dark-foreground/45 uppercase">
            {t("checkpointsTitle")}
          </p>
          <div
            data-process-checkpoints
            className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3"
          >
            {checkpoints.map((point) => (
              <span key={point} className="text-[13px] text-surface-dark-foreground/70">
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
