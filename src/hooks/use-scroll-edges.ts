"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Whether a scroll container has more content above or below its viewport.
 *
 * For panels that scroll internally (the pallet workshop's control and sheet
 * columns): without a cue, the last visible row is simply cut by the panel's
 * bottom edge and reads as a layout bug rather than as "there is more". The
 * caller draws the cue; this only reports the edges.
 *
 * Both flags are `false` until measured and whenever the content fits, so a
 * panel that doesn't scroll (narrow layouts, where it grows to its content)
 * never shows a cue. Re-measures on scroll and when either the container or
 * its content changes size — a fieldset appearing for a different pallet type
 * changes the scroll height without any scroll event.
 */
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [edges, setEdges] = useState({ moreAbove: false, moreBelow: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const moreAbove = el.scrollTop > 1;
      const moreBelow = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
      setEdges((prev) =>
        prev.moreAbove === moreAbove && prev.moreBelow === moreBelow ? prev : { moreAbove, moreBelow },
      );
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    // Children added later (a fieldset that only shows for one pallet type).
    const mo = new MutationObserver(() => {
      for (const child of Array.from(el.children)) ro.observe(child);
      measure();
    });
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return { ref, ...edges };
}
