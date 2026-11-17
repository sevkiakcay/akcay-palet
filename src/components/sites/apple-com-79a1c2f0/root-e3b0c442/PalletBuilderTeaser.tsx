"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInView } from "@/hooks/use-in-view";
import { BASE, calc, PRESETS, type PalletDesign, type PresetId } from "@/lib/pallet/model";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CtaArrow } from "../shared/CtaArrow";

gsap.registerPlugin(ScrollTrigger);

const PalletScene = dynamic(() => import("@/components/pallet-workshop/PalletScene").then((m) => m.PalletScene), {
  ssr: false,
});

const START_PRESETS = ["eu", "ind", "half", "custom"] as const;
type StartPreset = (typeof START_PRESETS)[number];

const NEAR_VIEWPORT: IntersectionObserverInit = { threshold: 0, rootMargin: "300px 0px" };

function designFor(id: StartPreset): PalletDesign {
  const preset = PRESETS.find((p) => p.id === (id as PresetId));
  return preset ? { ...BASE, ...preset.d } : BASE;
}

export function PalletBuilderTeaser() {
  const t = useTranslations("Builder");
  const tw = useTranslations("Workshop");
  const features = t.raw("features") as string[];
  const [preview, setPreview] = useState<StartPreset>("eu");
  const [no3d, setNo3d] = useState(false);
  const { ref: stageRef, inView: nearViewport } = useInView<HTMLDivElement>(NEAR_VIEWPORT);
  const design = useMemo(() => designFor(preview), [preview]);
  const height = Math.round(calc(design).H);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Left column content stagger
      gsap.from("[data-builder-text] > *", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: "top 75%" },
      });

      // 3D stage reveal with scale
      gsap.from("[data-builder-stage]", {
        scale: 0.95,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-builder-stage]", start: "top 80%" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="paletini-hazirla"
      className="film-grain light-sweep bg-surface-dark px-4 py-28 text-surface-dark-foreground md:px-6 md:py-40"
    >
      <div className="mx-auto grid max-w-[1100px] items-center gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-20">
        <div data-builder-text>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-surface-dark-foreground/50 uppercase">
            {tw("eyebrow")}
          </p>
          <h2 className="font-heading mt-4 text-[clamp(33px,5vw,52px)] leading-[1.03] font-semibold tracking-[-0.02em]">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-surface-dark-foreground/60 md:text-[16px]">
            {t("body")}
          </p>

          <p className="mt-10 text-[11px] font-medium tracking-[0.15em] text-surface-dark-foreground/45 uppercase">
            {t("startFrom")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {START_PRESETS.map((id) => (
              <li key={id}>
                <Link
                  href={{ pathname: "/pallet-workshop", query: { preset: id } }}
                  onMouseEnter={() => setPreview(id)}
                  onFocus={() => setPreview(id)}
                  aria-current={preview === id ? "true" : undefined}
                  className="inline-flex rounded-full border border-surface-dark-foreground/12 px-4 py-2 text-[13px] text-surface-dark-foreground/80 transition duration-300 hover:border-primary hover:text-surface-dark-foreground active:scale-[0.96] aria-[current=true]:border-primary-bright aria-[current=true]:text-surface-dark-foreground"
                >
                  {tw(`presets.${id}`)}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/pallet-workshop"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-[15px] font-semibold text-primary-foreground transition duration-300 hover:bg-primary/90 active:scale-[0.97]"
          >
            {t("cta")}
            <CtaArrow />
          </Link>
        </div>

        <div
          ref={stageRef}
          data-builder-stage
          className="relative aspect-[1480/1100] overflow-hidden rounded-2xl bg-[radial-gradient(70%_60%_at_50%_45%,#2a211a_0%,#120f0c_75%)] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] ring-1 ring-primary-bright/15"
        >
          {(no3d || !nearViewport) && (
            <Image
              src="/images/pallet-workshop-preview.webp"
              alt={t("imageAlt")}
              fill
              sizes="(min-width: 768px) 560px, 100vw"
              className="object-cover"
            />
          )}
          {nearViewport && !no3d && (
            <PalletScene
              design={design}
              camera="iso"
              cameraNonce={0}
              active
              showcase
              label={t("imageAlt")}
              onUnavailable={() => setNo3d(true)}
            />
          )}

          {/* Digital HUD */}
          <div aria-hidden className="pointer-events-none absolute inset-3 font-mono text-[10px] tracking-[0.12em] text-primary-bright/80 uppercase">
            <span className="absolute start-0 top-0 h-4 w-4 border-s border-t border-primary-bright/40" />
            <span className="absolute end-0 top-0 h-4 w-4 border-e border-t border-primary-bright/40" />
            <span className="absolute start-0 bottom-0 h-4 w-4 border-s border-b border-primary-bright/40" />
            <span className="absolute end-0 bottom-0 h-4 w-4 border-e border-b border-primary-bright/40" />
            <span className="absolute start-6 top-1.5 [direction:ltr]">
              {design.L} × {design.W} × {height} mm
            </span>
            <span className="absolute end-6 top-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-bright motion-reduce:animate-none" />
              3D
            </span>
          </div>

          <ul className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5 ps-5">
            {features.map((feature) => (
              <li
                key={feature}
                className="rounded-full bg-[#141210]/80 px-2.5 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/8 backdrop-blur-sm"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
