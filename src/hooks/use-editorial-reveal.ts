"use client";

import { useRef, type RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Staggered entrance for a section's own content: every descendant marked
 * `.gsap-reveal` fades/rises in, in document order, once, as the container
 * crosses into view — `ScrollTrigger.batch()` (GSAP's documented pattern for
 * staggering everything that enters around the same time), not one trigger
 * per element.
 *
 * Deliberately reuses `.gsap-reveal` (globals.css) rather than a new class:
 * it's the same "GSAP owns this element's entrance" contract Hero.tsx and
 * ProductsIntro.tsx already use for their own hand-timed sequences — same
 * static starting pose, same scripting/reduced-motion gate, same no-flash
 * guarantee. Scoped to whatever container ref is returned, so it never
 * queries outside its own section.
 *
 * Caller contract: attach the returned ref to a wrapper around the content
 * that should stagger in, and give each direct reveal target the
 * `gsap-reveal` class. Use a ref distinct from `useFrameOpenReveal`'s (that
 * one belongs on the `<section>` itself; this one belongs on an inner
 * content wrapper) — one DOM node can't own two independently-created refs.
 *
 * Generic over the wrapper's element type (defaults to `<div>`, the common
 * case) so the returned ref satisfies whatever tag it's actually attached to.
 */
export function useEditorialReveal<T extends HTMLElement = HTMLDivElement>(): RefObject<T | null> {
  const containerRef = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = containerRef.current?.querySelectorAll<HTMLElement>(".gsap-reveal");
        if (!targets || targets.length === 0) return;
        ScrollTrigger.batch(Array.from(targets), {
          start: "top 85%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "editorialEase", stagger: 0.08 }),
        });
      });
      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return containerRef;
}
