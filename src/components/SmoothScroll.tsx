"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
// GSAP's own documented defaults (gsap.ticker.lagSmoothing()'s signature is
// (threshold, adjustedLag)) — restored on teardown so disabling it for Lenis
// doesn't leak into the rest of the page's GSAP timelines/ScrollTriggers.
const GSAP_DEFAULT_LAG_SMOOTHING: [number, number] = [500, 33];

/**
 * Site-wide inertial smooth scroll, driven by GSAP's own ticker instead of
 * Lenis's default rAF loop — the integration GSAP's docs recommend — so
 * Lenis's virtual scroll position and every ScrollTrigger-scrubbed section
 * (HeroTransition, ProcessShowcase, the six `.frame-closed` sections) stay
 * frame-perfectly in sync instead of reading two independent scroll clocks.
 *
 * Disabled under `prefers-reduced-motion: reduce`, including a live OS-level
 * toggle mid-session: forced inertial scrolling is exactly the kind of motion
 * that preference exists to opt out of, and every ScrollTrigger here already
 * works correctly against plain native scroll (that's what they ran on
 * before this component existed).
 *
 * Mount only on pages that are pure document scroll. Not mounted on
 * `/pallet-workshop`: its 3D viewer uses wheel-to-zoom (OrbitControls,
 * enabled whenever the viewer isn't in home-page "showcase" mode) and the
 * workshop UI has several internal `overflow-auto` panels — both would need
 * explicit `data-lenis-prevent` treatment to coexist with a page-wide wheel
 * listener, which is a separate, deliberate piece of work, not bundled here.
 */
export function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION);
    if (mq.matches) return;

    let lenis: Lenis | null = new Lenis();
    const onTick = (time: number) => lenis?.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const teardown = () => {
      if (!lenis) return;
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(...GSAP_DEFAULT_LAG_SMOOTHING);
      lenis.destroy();
      lenis = null;
    };

    // OS-level reduced-motion toggled on mid-session: tear down immediately.
    const onChange = () => {
      if (mq.matches) teardown();
    };
    mq.addEventListener("change", onChange);

    return () => {
      mq.removeEventListener("change", onChange);
      teardown();
    };
  }, []);

  return null;
}
