"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitText from "@/components/SplitText";
import { useEditorialReveal } from "@/hooks/use-editorial-reveal";
import { useFrameOpenReveal } from "@/hooks/use-frame-open-reveal";
import { gsap, useGSAP } from "@/lib/gsap";

type Step = { title: string; desc: string };

// Kontrol noktaları üretim sürecimizin bir parçasıdır; bunlar bağımsız bir
// sertifikasyon iddiası değildir. Doğrulanmış sertifika/belge bilgisi
// eklendiğinde bu bölüm ayrı bir "Belgelerimiz" bileşeniyle genişletilebilir.
// TODO: Onaylı sertifika/belge bilgisi netleşince ayrı bölüm eklenecek.

export function ProcessShowcase() {
  const t = useTranslations("Process");
  const steps = t.raw("steps") as Step[];
  const checkpoints = t.raw("checkpoints") as string[];
  const sectionRef = useFrameOpenReveal();
  const bodyRef = useEditorialReveal();
  const lineRef = useRef<HTMLDivElement>(null);

  // The copper (now white) line across the steps track: its own tween, since
  // a growing scaleX line isn't the same shape as the fade/rise batch above.
  // No static CSS "hidden" class for this one (unlike `.gsap-reveal`/
  // `.frame-closed`) — gsap.set() establishes scaleX:0 only inside the same
  // matchMedia branch that animates it back, so the safe default with no JS
  // or under reduced motion is simply a fully-drawn line, never a stuck-at-0
  // invisible one.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(lineRef.current, { scaleX: 0 });
        gsap.to(lineRef.current, {
          scaleX: 1,
          duration: 1.1,
          ease: "editorialEase",
          scrollTrigger: { trigger: lineRef.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: lineRef },
  );

  return (
    <section
      ref={sectionRef}
      id="uretim-sureci"
      className="frame-closed film-grain bg-black py-20 text-white md:py-28"
    >
      <div ref={bodyRef}>
        <div className="px-6 text-center">
          <p className="gsap-reveal text-caption font-normal tracking-[0.2em] text-white/55 uppercase">
            {t("eyebrow")}
          </p>
          <SplitText
            text={t("title")}
            tag="h2"
            splitType="words"
            delay={40}
            duration={0.9}
            effect="rise"
            className="mt-3 text-section leading-[1.0] font-normal tracking-[-0.015em] text-white"
          />
        </div>

        <div className="editorial-shell mt-16 md:mt-20">
          {/* Desktop choreography: a line draws across the track and each step
              arrives as the line reaches it. Stacked on phones, the steps simply
              follow each other in quicker succession. */}
          <div className="relative grid gap-x-6 gap-y-12 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute top-[14px] right-[16.5%] left-[16.5%] hidden h-px bg-white/15 sm:block"
            >
              <div ref={lineRef} className="h-full origin-left bg-white" />
            </div>
            {steps.map((step, i) => (
              <div key={i} className="gsap-reveal relative text-center">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-black ring-1 ring-white/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <p className="mt-4 font-mono text-small tracking-widest text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-body-lg font-medium">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[240px] text-ui text-white/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-[1078px] px-6 md:mt-24">
          <p className="gsap-reveal text-center text-caption font-medium tracking-wide text-white/55 uppercase">
            {t("checkpointsTitle")}
          </p>
          <div className="gsap-reveal mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {checkpoints.map((point) => (
              <span key={point} className="text-small text-white/80">
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
