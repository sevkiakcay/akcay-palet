"use client";

import { useEffect } from "react";

const SELECTOR = ".film-grain, .light-sweep";
// Matches the rootMargin PalletBuilderTeaser's own useInView already uses for
// "near enough to matter" — generous enough that the loop doesn't visibly
// stutter right as a section crosses the viewport edge.
const ROOT_MARGIN = "300px 0px";

/**
 * Pauses the `.film-grain`/`.light-sweep` ambient CSS loops (globals.css —
 * `grain-jitter`, `sweep`) while their section is off-screen, resuming them
 * once it's back in view. One shared IntersectionObserver for every such
 * section currently in the DOM, so these always-on infinite animations don't
 * keep compositing on sections the visitor has scrolled well past.
 *
 * Toggles a plain `data-anim-paused` attribute (globals.css reads it off
 * `::before`/`::after`, which no JS can select directly) rather than React
 * state, so this never triggers a re-render. Renders nothing; mount it once
 * per page that has `.film-grain`/`.light-sweep` sections.
 */
export function AmbientMotionPause() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(SELECTOR);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute("data-anim-paused", !entry.isIntersecting);
        }
      },
      { rootMargin: ROOT_MARGIN },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
