import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * Central GSAP registration. Every component that animates with GSAP imports
 * from here instead of "gsap"/"gsap/ScrollTrigger"/etc. directly, so every
 * plugin and useGSAP are registered exactly once no matter how many
 * components pull this module in. Guarded for SSR: gsap/ScrollTrigger are
 * browser-only tools and must never run during the server render pass.
 *
 * The three named eases mirror globals.css's `--motion-ease`,
 * `--motion-ease-in-out` and `--editorial-ease` custom properties — the
 * site's single easing source of truth — so GSAP tweens curve identically to
 * the CSS animations they sit alongside. Keep these in sync if those custom
 * properties ever change.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, useGSAP);
  CustomEase.create("motionEase", "0.16, 1, 0.3, 1");
  CustomEase.create("motionEaseInOut", "0.65, 0, 0.35, 1");
  CustomEase.create("editorialEase", "0.19, 1, 0.22, 1");
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
