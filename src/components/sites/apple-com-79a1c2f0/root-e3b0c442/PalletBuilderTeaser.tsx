"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInView } from "@/hooks/use-in-view";
import { BASE, calc, PRESETS, type PalletDesign, type PresetId } from "@/lib/pallet/model";
import { stagger } from "@/lib/motion";
import { CtaArrow } from "../shared/CtaArrow";
import { Reveal } from "../shared/Reveal";

// three.js only on the client, and only once the section is near the viewport.
const PalletScene = dynamic(() => import("@/components/pallet-workshop/PalletScene").then((m) => m.PalletScene), {
  ssr: false,
});

// Presets offered as one-click starting points; each deep-links into the
// workshop with that preset preloaded (PalletWorkshop reads `?preset=`).
const START_PRESETS = ["eu", "ind", "half", "custom"] as const;
type StartPreset = (typeof START_PRESETS)[number];

const NEAR_VIEWPORT: IntersectionObserverInit = { threshold: 0, rootMargin: "300px 0px" };

function designFor(id: StartPreset): PalletDesign {
  const preset = PRESETS.find((p) => p.id === (id as PresetId));
  return preset ? { ...BASE, ...preset.d } : BASE;
}

/**
 * Home-page "Paletini Hazırla" section — the entry point to the Pallet Workshop,
 * shown as a live, slowly turning 3D pallet on a copper blueprint grid (the same
 * model the workshop builds). Hovering or focusing a size chip swaps the model in
 * place; the numbers in the corner are the model's real outer dimensions. The
 * static render stays as the poster until WebGL is ready, and as the fallback.
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

  return (
    <section
      id="paletini-hazirla"
      className="frame-open film-grain light-sweep bg-surface-dark px-4 py-20 text-surface-dark-foreground md:px-6 md:py-28"
    >
      <div className="mx-auto grid max-w-[1024px] items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14">
        <Reveal>
          <p className="reveal-item text-[12px] font-semibold tracking-[0.2em] text-surface-dark-foreground/55 uppercase">
            {tw("eyebrow")}
          </p>
          <h2
            className="reveal-item font-heading mt-3 text-[33px] leading-[1.05] font-semibold tracking-[-0.015em] md:text-[46px]"
            style={stagger(1)}
          >
            {t("title")}
          </h2>
          <p
            className="reveal-item mt-4 max-w-[440px] text-[15px] leading-relaxed text-surface-dark-foreground/65"
            style={stagger(2)}
          >
            {t("body")}
          </p>

          <p
            className="reveal-item mt-8 text-[11px] font-medium tracking-[0.12em] text-surface-dark-foreground/55 uppercase"
            style={stagger(3)}
          >
            {t("startFrom")}
          </p>
          <ul className="reveal-item mt-3 flex flex-wrap gap-2" style={stagger(4)}>
            {START_PRESETS.map((id) => (
              <li key={id}>
                <Link
                  href={{ pathname: "/pallet-workshop", query: { preset: id } }}
                  onMouseEnter={() => setPreview(id)}
                  onFocus={() => setPreview(id)}
                  aria-current={preview === id ? "true" : undefined}
                  className="inline-flex rounded-full border border-surface-dark-foreground/15 px-3.5 py-1.5 text-[13px] text-surface-dark-foreground/85 transition duration-200 hover:border-primary hover:text-surface-dark-foreground active:scale-[0.96] aria-[current=true]:border-primary-bright aria-[current=true]:text-surface-dark-foreground"
                >
                  {tw(`presets.${id}`)}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/pallet-workshop"
            className="reveal-item group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[15px] font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 active:scale-[0.97]"
            style={stagger(5)}
          >
            {t("cta")}
            <CtaArrow />
          </Link>
        </Reveal>

        <Reveal>
          <div
            ref={stageRef}
            className="reveal-item relative aspect-[1480/1100] overflow-hidden rounded-2xl bg-[radial-gradient(70%_60%_at_50%_45%,#2a211a_0%,#120f0c_75%)] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] ring-1 ring-primary-bright/20"
            style={stagger(1)}
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

            {/* Digital HUD: corner brackets, live outer dimensions, model label. */}
            <div aria-hidden className="pointer-events-none absolute inset-3 font-mono text-[10px] tracking-[0.12em] text-primary-bright/90 uppercase">
              <span className="absolute start-0 top-0 h-4 w-4 border-s border-t border-primary-bright/60" />
              <span className="absolute end-0 top-0 h-4 w-4 border-e border-t border-primary-bright/60" />
              <span className="absolute start-0 bottom-0 h-4 w-4 border-s border-b border-primary-bright/60" />
              <span className="absolute end-0 bottom-0 h-4 w-4 border-e border-b border-primary-bright/60" />
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
                  className="rounded-full bg-[#141210]/80 px-2.5 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/10 backdrop-blur-sm"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
