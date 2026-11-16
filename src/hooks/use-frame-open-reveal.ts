"use client";

import { useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Same clip-path values as the legacy CSS `.frame-open`/`@keyframes frame-open`
// (globals.css) that this replaces, one section at a time — a rounded, inset
// frame that opens to full-bleed as the section scrolls into view.
const FRAME_CLOSED = "inset(0px 5% 0px 5% round 32px)";
const FRAME_OPEN = "inset(0px 0px 0px 0px round 0px)";

/**
 * The "frame opens like a film gate" section reveal, scrubbed with
 * ScrollTrigger instead of CSS `animation-timeline: view()` — shared by every
 * section that used to carry the `.frame-open` class (first extracted when
 * migrating the second one, since the first — ProcessShowcase — showed this
 * would otherwise be the exact same ~15 lines repeated per section).
 *
 * Gated behind `prefers-reduced-motion: no-preference` via `gsap.matchMedia`:
 * under reduced motion nothing runs and the section reads full-bleed from the
 * first paint. Cleanup is automatic (useGSAP's context revert + the returned
 * `mm.revert()`).
 *
 * Caller contract: attach the returned ref to the section element AND give
 * that element the static `.frame-closed` class (globals.css) — that class
 * holds the pre-animation pose so there's no flash of the open state before
 * this hook's effect runs. Don't also add `.frame-open` (the legacy class) —
 * that would double up two different reveal mechanisms on one element.
 */
export function useFrameOpenReveal(): RefObject<HTMLElement | null> {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          sectionRef.current,
          { clipPath: FRAME_CLOSED },
          {
            clipPath: FRAME_OPEN,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "top 65%",
              scrub: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return sectionRef;
}
