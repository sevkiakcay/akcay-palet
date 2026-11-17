# Akçay Palet — Motion Architecture

Three animation runtimes ship on this site. This file says which one owns what,
because the failure mode of three runtimes is not performance — it is two of
them fighting over the same transform on the same node, which produces jitter
that is very hard to trace back.

## Ownership

| Runtime | Owns | Never touches |
| --- | --- | --- |
| **GSAP + ScrollTrigger** | anything driven by scroll position: section reveals, scrubbed clip-paths, parallax, pinned sequences, split-text staggers | React mount/unmount, gestures |
| **Motion** (`motion/react`) | React components entering and leaving, gestures, layout transitions, control micro-interactions | scroll-driven timelines |
| **Three.js** | the 3D object lifecycle inside the pallet canvas — geometry, materials, camera, its own rAF loop | DOM |
| **CSS** | the ambient cinematic layer (film grain, light sweep, letterbox) and the static pre-animation poses | anything stateful |

The hard rule: **GSAP and Motion must not animate the same property on the same
node.** If a node has a GSAP ScrollTrigger on its `y`, Motion may animate its
`opacity` but not its `y`. In practice they rarely meet, because the split is
scroll vs. mount and almost no node needs both.

### Why GSAP keeps scroll

Lenis drives the page through `gsap.ticker` (`src/components/SmoothScroll.tsx`),
so Lenis's virtual scroll position and every scrubbed ScrollTrigger read the
same clock, frame for frame. Motion's `useScroll` runs its own loop; a scrubbed
Motion value would drift against the Lenis-driven ones by a frame or two,
which is visible on a scrub. There is also no Motion equivalent of GSAP's
`SplitText`, which the headline reveals depend on.

### Why Motion was added

Before Motion, **nothing on this site animated on exit.** `tw-animate-css` is
CSS-only, so when React unmounts a node there is nobody left to run an
animation — four pieces of UI appeared softly and then vanished on a frame:

| Surface | Before | After |
| --- | --- | --- |
| Header mobile menu | no animation either way | `dropdown` preset, both ways |
| `LanguageSwitcher` dropdown | `animate-in` on enter, instant exit | `dropdown` preset, both ways |
| `QuoteForm` steps (3) | `animate-in` on enter, instant swap | `panelSwap`, with the outgoing step leaving |
| `QuoteDialog` | no animation either way | `backdrop` + `modal` |

Doing that in GSAP means hand-writing a "delay the unmount until the tween
finishes" state machine per surface. `AnimatePresence` is exactly that
machine.

## Easing

One curve family, three copies, because none of the three runtimes can read
another's source:

| Curve | CSS (`globals.css`) | GSAP (`lib/gsap.ts`) | Motion (`lib/motion.ts`) |
| --- | --- | --- | --- |
| default editorial | `--editorial-ease` | `editorialEase` | `EASE_EDITORIAL` |
| control settle | `--motion-ease` | `motionEase` | `EASE_PRECISE` |
| symmetric travel | `--motion-ease-in-out` | `motionEaseInOut` | `EASE_IN_OUT` |

Change one, change all three. There is no build-time check for this; the
comment in each file points at the other two.

## Presets

`src/lib/motion.ts` exports the four enter/leave presets the site uses —
`panelSwap`, `dropdown`, `backdrop`, `modal` — rather than letting each
component invent its own distances and durations. A new surface should reach
for one of these before adding a fifth.

## Reduced motion

Every runtime is gated, and the gates differ because the right answer differs.

- **GSAP** — `gsap.matchMedia()` keyed on `(prefers-reduced-motion: no-preference)`.
  Under `reduce` the tween never runs and the element reads at its final pose
  from the first paint. The static pre-animation poses in `globals.css`
  (`.gsap-reveal`, `.frame-closed`) are themselves behind
  `@media screen and (scripting: enabled) and (prefers-reduced-motion: no-preference)`,
  so a visitor with JS off never sees content stuck at `opacity: 0`.
- **Lenis** — torn down entirely under `reduce`, including a live OS-level
  toggle mid-session. Forced inertial scrolling is the archetypal thing that
  preference exists to opt out of.
- **Motion** — `useReducedMotion()` plus `withoutMovement()`, which strips the
  translate/scale out of a preset and keeps the opacity fade. The element must
  still appear and disappear: removing the animation outright would make
  `AnimatePresence` unmount instantly and lose the exit, which is the whole
  reason Motion is here. A cross-fade is not the motion the preference is
  about.
- **Three.js** — the hero timeline holds at its final assembled pose and the
  rAF loop stops; orbit and scrub stay available, since those are
  user-initiated.

## Hero assembly tour

The 21-second take-apart/put-back tour in `PalletBuilderTeaser` is Three.js
territory: the scene poses every board and the camera from one playhead each
frame (`lib/pallet/cinematic.ts`, pure functions of `t`). Nothing GSAP or
Motion animates touches the canvas. Motion only swaps the caption text under
the stage (`PalletTourControls`).

- **Playhead** — `use-cinematic-timeline` keeps it in a ref the scene reads per
  frame; React sees a throttled copy (~10×/s) for the slider and caption.
  Dragging the slider pauses the tour.
- **Off screen** — `useIsVisible` (not `useInView`, which latches `true` and
  stops watching) follows the stage both ways. Off screen the playhead loop is
  torn down and `PalletScene` gets `active={false}`, so it stops issuing draw
  calls. The scene's own rAF keeps ticking, cheaply, without rendering.
- **Reduced motion** — no autoplay: the tour holds at 0 s, the assembled pallet;
  play and replay are not rendered and a note says why. The slider stays,
  because scrubbing is motion the visitor makes.
- **No WebGL** — the static preview image stays and the tour controls are not
  rendered at all.

## Performance

- Server Components stay the default. Motion, GSAP and Three.js live in small
  `"use client"` islands, not whole-page clients.
- `AmbientMotionPause` (`shared/`) toggles one attribute that pauses the CSS
  cinematic layer; it is the single switch for grain and light sweep.
- The hero video pauses off screen and resumes on return.
- Three.js: pixel ratio capped, rendering stopped when the canvas is offscreen
  (`active`; the rAF itself keeps ticking), geometries and materials disposed on unmount, resize listener
  removed. The scene is `dynamic(..., { ssr: false })` and mounts only once its
  section is near the viewport (`use-in-view`).
- `ScrollTrigger.refresh()` runs on real document-height changes (debounced
  `ResizeObserver`) and once `document.fonts.ready` settles, because late fonts
  and the late-mounting 3D canvas both move every section below them.
