"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook that provides a scoped GSAP context.
 * All animations created inside the callback are automatically
 * cleaned up when the component unmounts.
 */
export function useGsap(
  callback: (ctx: gsap.Context) => void,
  deps: React.DependencyList = []
) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      callback(ctx!);
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

/**
 * Common GSAP defaults for consistent animation feel across the site.
 */
export const GSAP_DEFAULTS = {
  ease: "power3.out",
  duration: 1,
} as const;

/**
 * Scroll-triggered fade-in-up animation config.
 */
export function fadeInUp(delay = 0) {
  return {
    y: 40,
    opacity: 0,
    duration: 1,
    delay,
    ease: "power3.out",
  };
}

/**
 * Standard ScrollTrigger config for section reveals.
 */
export function sectionTrigger(trigger: string | Element) {
  return {
    trigger,
    start: "top 85%",
    end: "bottom 20%",
    toggleActions: "play none none none" as const,
  };
}
