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

    // Same-page anchor links (#urunler, #uretim-sureci, #neden-akcay, #iletisim…)
    // go through Lenis instead of the browser's native hash jump, so the glide
    // uses the same easing as wheel scrolling and every scrubbed ScrollTrigger
    // tracks it frame by frame. Lenis's own `anchors` option isn't used: it
    // doesn't preventDefault, so the native jump would still race it, and it
    // never moves focus. Capture phase on document runs before React's root
    // listener, so preventDefault() here makes next/link skip its own hash
    // navigation (it checks `defaultPrevented`) while component onClick
    // handlers — e.g. the mobile menu closing — still run. Lenis already
    // subtracts `scroll-padding-top`, so targets land below the fixed nav.
    const onAnchorClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      if (location.hash !== url.hash) history.pushState(history.state, "", url.hash);
      lenis.scrollTo(target, {
        // Move focus with the view so keyboard and screen-reader users continue from the section.
        onComplete: () => {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        },
      });
    };
    document.addEventListener("click", onAnchorClick, true);

    const teardown = () => {
      if (!lenis) return;
      document.removeEventListener("click", onAnchorClick, true);
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

  // ScrollTrigger measures start/end positions once and only re-measures on
  // window resize. Content that settles later — web fonts reflowing headings,
  // the lazily-mounted 3D teaser, the quote form expanding — moves every
  // section below it, leaving their reveals firing early or late. Re-measure
  // whenever the document's height actually changes (debounced), and once
  // the fonts are in.
  useEffect(() => {
    let lastHeight = document.documentElement.scrollHeight;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const height = document.documentElement.scrollHeight;
        if (height === lastHeight) return;
        lastHeight = height;
        ScrollTrigger.refresh();
      }, 150);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    let active = true;
    document.fonts?.ready.then(() => {
      if (active) ScrollTrigger.refresh();
    });
    return () => {
      active = false;
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return null;
}
