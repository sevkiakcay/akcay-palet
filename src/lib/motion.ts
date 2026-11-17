/**
 * Central Motion setup, the mirror of `src/lib/gsap.ts`.
 *
 * Every component that animates with Motion imports its easing and its
 * transition presets from here rather than inlining a cubic-bezier, so the two
 * animation libraries on this site curve identically. The arrays below are the
 * same control points as `--motion-ease`, `--motion-ease-in-out` and
 * `--editorial-ease` in globals.css, which `lib/gsap.ts` also mirrors as GSAP
 * `CustomEase` instances. Three copies of one curve is two too many, but CSS
 * custom properties can't be read from a tween at author time — so if one
 * changes, all three change. See `docs/motion-plan.md`.
 *
 * Ownership, in one line: Motion animates React components entering and
 * leaving, gestures and layout. GSAP owns everything driven by scroll
 * position. Three.js owns the 3D object lifecycle. The two libraries must
 * never animate the same property on the same node.
 */

/** `--editorial-ease` — the site's default curve. */
export const EASE_EDITORIAL = [0.19, 1, 0.22, 1] as const;
/** `--motion-ease` — slightly tighter settle, for controls. */
export const EASE_PRECISE = [0.16, 1, 0.3, 1] as const;
/** `--motion-ease-in-out` — symmetric, for things that travel both ways. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/**
 * Enter/leave for a panel that replaces another in place — a form step, a
 * dialog body. Short, because the user is waiting on it.
 */
export const panelSwap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: EASE_EDITORIAL },
} as const;

/**
 * Enter/leave for something that drops from a trigger — a dropdown, the mobile
 * nav sheet. Scales very slightly so it reads as attached to its button.
 */
export const dropdown = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.2, ease: EASE_PRECISE },
} as const;

/** A modal's backdrop. Opacity only — a blurred, scaling backdrop is noise. */
export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.24, ease: EASE_IN_OUT },
} as const;

/**
 * A modal's own box. Rises a little further than a dropdown and settles
 * slower, because it takes over the screen.
 */
export const modal = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.98 },
  transition: { duration: 0.32, ease: EASE_EDITORIAL },
} as const;

/**
 * Strips the movement out of any preset above, keeping the opacity fade.
 *
 * Under `prefers-reduced-motion: reduce` the element must still appear and
 * disappear — removing the animation entirely would make `AnimatePresence`
 * unmount instantly and lose the exit, which is the thing these presets were
 * added for. Fading is not the motion that preference is about.
 *
 * Movement keys are pinned to their resting value (the one in `animate`)
 * rather than deleted. `useReducedMotion()` is `null` on the server and only
 * becomes `true` on the client, so an SSR-rendered node is rendered once with
 * the full preset and hydrated with this one; if the keys differed, the
 * resting style would differ too (`transform: none` vs. nothing) and React
 * would report a hydration mismatch. Same keys, same resting style — and
 * `y: 0 → 0` moves nothing.
 */
export function withoutMovement<T extends { initial: object; animate: object; exit: object }>(
  preset: T,
): T {
  const rest = preset.animate as Record<string, unknown>;
  const pin = (v: object) =>
    Object.fromEntries(
      Object.entries(v).map(([key, value]) => [key, key === "opacity" ? value : (rest[key] ?? value)]),
    );
  return {
    ...preset,
    initial: pin(preset.initial),
    animate: pin(preset.animate),
    exit: pin(preset.exit),
  };
}
