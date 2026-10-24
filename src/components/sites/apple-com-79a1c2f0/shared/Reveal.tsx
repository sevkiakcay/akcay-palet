"use client";

import type { ElementType, HTMLAttributes } from "react";
import { useInView } from "@/hooks/use-in-view";

// Fires as the group's top edge crosses ~88% of the viewport height: early enough
// that the motion is seen, late enough that it isn't spent below the fold.
const OBSERVER_OPTIONS: IntersectionObserverInit = { threshold: 0, rootMargin: "0px 0px -12% 0px" };

type RevealProps = HTMLAttributes<HTMLElement> & { as?: "div" | "ol" | "tbody" };

/**
 * Scroll-reveal group: marks itself `data-inview` the first time it enters the
 * viewport, and globals.css animates its `.reveal-*` children in (staggered via
 * `stagger(i)` from lib/motion). One observer per group, never re-hidden. Don't
 * nest groups — an outer group in view would start the inner group's children.
 */
export function Reveal({ as = "div", ...rest }: RevealProps) {
  // Widened so one HTMLElement ref fits whichever tag is rendered.
  const Tag = as as ElementType;
  const { ref, inView } = useInView<HTMLElement>(OBSERVER_OPTIONS);
  return <Tag ref={ref} data-inview={inView ? "" : undefined} {...rest} />;
}
