"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SplitText from "@/components/SplitText";
import { useCinematicTimeline } from "@/hooks/use-cinematic-timeline";
import { useEditorialReveal } from "@/hooks/use-editorial-reveal";
import { useFrameOpenReveal } from "@/hooks/use-frame-open-reveal";
import { useInView, useIsVisible } from "@/hooks/use-in-view";
import { BASE, calc, PRESETS, type PalletDesign, type PresetId } from "@/lib/pallet/model";
import { CtaArrow } from "../shared/CtaArrow";
import { PalletTourControls } from "./PalletTourControls";

// three.js only on the client, and only once the section is near the viewport.
const PalletScene = dynamic(() => import("@/components/pallet-workshop/PalletScene").then((m) => m.PalletScene), {
  ssr: false,
});

// Presets offered as one-click starting points; each deep-links into the
// workshop with that preset preloaded (PalletWorkshop reads `?preset=`).
const START_PRESETS = ["eu", "ind", "half", "custom"] as const;
type StartPreset = (typeof START_PRESETS)[number];

const NEAR_VIEWPORT: IntersectionObserverInit = { threshold: 0, rootMargin: "300px 0px" };
// Actually on screen, no margin: the tour and the WebGL render stop the moment
// the last pixel of the stage leaves the viewport.
const ON_SCREEN: IntersectionObserverInit = { threshold: 0 };

function designFor(id: StartPreset): PalletDesign {
  const preset = PRESETS.find((p) => p.id === (id as PresetId));
  return preset ? { ...BASE, ...preset.d } : BASE;
}

/**
 * Home-page "Paletini Hazırla" section — the entry point to the Pallet Workshop
 * (untouched — same preset links, same 3D scene, same hover-to-preview logic),
 * shown as a live, slowly turning 3D pallet. Only the surrounding chrome
 * (copy styling, card shape, CTA colors) follows the editorial rebrand.
 */
export function PalletBuilderTeaser() {
  const t = useTranslations("Builder");
  const tw = useTranslations("Workshop");
  const features = t.raw("features") as string[];
  const [preview, setPreview] = useState<StartPreset>("eu");
  const [no3d, setNo3d] = useState(false);
  const { ref: stageRef, inView: nearViewport } = useInView<HTMLDivElement>(NEAR_VIEWPORT);
  const design = useMemo(() => designFor(preview), [preview]);
  const height = Math.round(calc(design).H);
  const sectionRef = useFrameOpenReveal();
  const bodyRef = useEditorialReveal();

  // The assembly tour. Runs only while the scene is mounted and the stage is
  // actually on screen, so a pallet does not animate behind a section nobody is
  // looking at. See docs/motion-plan.md for why Three.js owns this and not GSAP.
  // `nearViewport` latches (it only decides when to mount the scene);
  // `stageVisible` follows the stage both ways and is what stops the playhead
  // and, through `active`, the WebGL draw calls.
  const stageVisible = useIsVisible(stageRef, ON_SCREEN);
  const sceneOn = nearViewport && !no3d;
  const tour = useCinematicTimeline({ inView: stageVisible, enabled: sceneOn });

  return (
    <section
      ref={sectionRef}
      id="paletini-hazirla"
      className="frame-closed film-grain light-sweep bg-black px-4 py-20 text-white md:px-6 md:py-28"
    >
      <div ref={bodyRef} className="mx-auto grid max-w-[1078px] items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14">
        <div>
            <p className="gsap-reveal text-caption font-normal tracking-[0.2em] text-white/55 uppercase">
              {tw("eyebrow")}
            </p>
            <SplitText
              text={t("title")}
              tag="h2"
              splitType="words"
              delay={40}
              duration={0.9}
              effect="rise"
              className="mt-3 text-section leading-[1.0] font-normal tracking-[-0.015em]"
            />
            <p className="gsap-reveal mt-4 max-w-[440px] text-body leading-relaxed text-white/65">{t("body")}</p>

            <p className="gsap-reveal mt-8 text-micro font-medium tracking-[0.12em] text-white/55 uppercase">
              {t("startFrom")}
            </p>
            <ul className="gsap-reveal mt-3 flex flex-wrap gap-2">
              {START_PRESETS.map((id) => (
                <li key={id}>
                  <Link
                    href={{ pathname: "/pallet-workshop", query: { preset: id } }}
                    onMouseEnter={() => setPreview(id)}
                    onFocus={() => setPreview(id)}
                    aria-current={preview === id ? "true" : undefined}
                    className="inline-flex rounded-pill border border-white/15 px-3.5 py-1.5 text-small text-white/85 transition duration-200 hover:border-white hover:text-white active:scale-[0.96] aria-[current=true]:border-white aria-[current=true]:text-white"
                  >
                    {tw(`presets.${id}`)}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/pallet-workshop"
              className="gsap-reveal group mt-8 inline-flex items-center gap-2 rounded-pill bg-white px-6 py-2.5 text-body font-semibold text-black transition duration-200 hover:bg-white/90 active:scale-[0.97]"
            >
              {t("cta")}
              <CtaArrow />
            </Link>
          </div>

          <div>
          <div
            ref={stageRef}
            className="gsap-reveal relative aspect-[1480/1100] overflow-hidden rounded-none border border-white/15 bg-black"
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
            {sceneOn && (
              <PalletScene
                design={design}
                camera="iso"
                cameraNonce={0}
                active={stageVisible}
                showcase
                cinematic={tour.ref}
                label={t("imageAlt")}
                onUnavailable={() => setNo3d(true)}
              />
            )}

            {/* Digital HUD: corner brackets, live outer dimensions, model label. */}
            <div aria-hidden className="pointer-events-none absolute inset-3 font-mono text-nano tracking-[0.12em] text-white/90 uppercase">
              <span className="absolute start-0 top-0 h-4 w-4 border-s border-t border-white/60" />
              <span className="absolute end-0 top-0 h-4 w-4 border-e border-t border-white/60" />
              <span className="absolute start-0 bottom-0 h-4 w-4 border-s border-b border-white/60" />
              <span className="absolute end-0 bottom-0 h-4 w-4 border-e border-b border-white/60" />
              <span className="absolute start-6 top-1.5 [direction:ltr]">
                {design.L} × {design.W} × {height} mm
              </span>
              <span className="absolute end-6 top-1.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
                3D
              </span>
            </div>

            <ul className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5 ps-5">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="rounded-pill border border-white/15 bg-black/80 px-2.5 py-1 text-micro font-medium text-white/90 backdrop-blur-sm"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          {/* Only with a live scene: over the static image there is nothing to drive. */}
          {sceneOn && <PalletTourControls tour={tour} />}
        </div>
      </div>
    </section>
  );
}
