---
name: anatomy
description: Build crafted, interactive isometric SVG figures that explain a technical idea as a real physical object (a test rig, a dial gauge, a cabinet of drawers, a plotter, a lock), with many small precise solid parts, hover labels, and optional click-to-explode or scroll-driven assembly. Use when asked to create an anatomy diagram, exploded view, technical illustration, isometric breakdown, or interactive SVG figure of any concept.
---

# Anatomy — Interactive Isometric SVG Figures

A construction skill. It turns a technical concept into a **single self-contained inline SVG** (or a React component wrapping one) that reads like a cutaway illustration from a precision-engineering manual — isometric perspective, many small solid parts, clean label lines, optional interactivity.

## Operating Posture

You are a technical illustrator who also writes code. The bar is the quality of a Haynes manual cutaway or an Apple product exploded view — every part is geometrically precise, proportioned, and placed with intent. The figure must teach something; decoration alone is not enough.

Two failure modes:

1. **A diagram that doesn't explain.** If the viewer can't point at a part and understand what it does, the figure failed. Every visible part either teaches or orients.
2. **Sloppy geometry.** Misaligned edges, inconsistent isometric angles, parts that float or overlap without reason. Precision is the entire point.

## Construction Order

1. **Decide the metaphor.** What physical object best explains the concept? A lock for encryption, a plotter for a rendering pipeline, a cabinet for a data store, a dial gauge for a metric. The metaphor must map — every visible part has a 1:1 correspondence to the concept it represents.

2. **Choose the isometric grid.** Pick a consistent isometric projection (typically 30° from horizontal for both axes). All parts share the same vanishing angles. Never mix perspectives.

3. **Inventory the parts.** List every piece the figure needs — name, purpose in the metaphor, approximate size relative to the whole. Order them from innermost/bottommost to outermost/topmost.

4. **Draw bottom-up.** Start with the base/frame, then internal mechanisms, then the housing/shell. Each part is a closed SVG path or group with:
   - Distinct `fill` per face (top, left, right) to sell the 3D illusion — use HSL shifts of the same hue: lightest on top, darkest on the side away from the light source.
   - `stroke` for edges — thin (0.5–1px), slightly darker than the darkest face.
   - A meaningful `id` or `data-part` attribute for interactivity.

5. **Add label lines.** Thin leader lines (1px, muted colour) from each part to a text label placed outside the figure's silhouette. Labels use the project's type tokens (`text-nano`, `text-micro`, `text-caption`). Group related labels on the same side. Never let a leader line cross another.

6. **Wire interactivity** (when requested):
   - **Hover:** Highlight the hovered part (raise opacity or add a subtle stroke glow), show its label if labels are hidden by default.
   - **Click-to-explode:** Translate parts outward along their isometric axis with a CSS transition or GSAP tween; a second click reassembles. Keep the explosion vector consistent with the part's position in the assembly.
   - **Scroll-driven assembly:** Parts fly in from off-canvas and settle into place as the user scrolls. Use GSAP ScrollTrigger (the project's scroll-animation runtime). Each part's entrance is staggered by its layer order.

7. **Colour and theming.** Respect the project's design tokens. Use `var(--editorial-ink)` for strokes and labels, `var(--editorial-bg)` for background fills if needed. Part fills should be from a cohesive palette — metallic grays for mechanical parts, warm wood tones for organic parts, accent colours sparingly for the "hero" part that the figure is about.

8. **Responsiveness.** The SVG `viewBox` defines the coordinate system; the wrapper scales it. At narrow widths, labels may reflow below the figure as a keyed list rather than leader lines (use a container query or a media query).

## Output Format

- **Inline in a page:** A React component (`*.tsx`) exporting a named function. The SVG is JSX, not an external file. Props control interactivity mode (`hover`, `explode`, `scroll`, `static`), and an optional `parts` override for custom labels/colours.
- **Standalone artifact:** When used outside the codebase (e.g. for a presentation or documentation), output a single `.svg` file with embedded `<style>` and `<script>` for interactivity, no external dependencies.

## Quality Checklist

- [ ] Every visible part maps to a concept; no decorative filler.
- [ ] Isometric angles are consistent across all parts (±0.5° tolerance in path coordinates).
- [ ] Three-face shading on every solid part (top/left/right or equivalent).
- [ ] No leader lines cross each other.
- [ ] Hover/click targets have adequate hit area (minimum 24×24px equivalent in viewBox units).
- [ ] The figure is legible at 320px wide (labels readable, parts distinguishable).
- [ ] Colour contrast meets WCAG AA against the background.
- [ ] Uses project type tokens for all text; no `text-[Npx]`.
- [ ] If GSAP is used, it doesn't animate any property that Motion also animates on the same node.
- [ ] `aria-label` or `<title>`+`<desc>` on the root `<svg>` for screen readers; decorative sub-parts are `aria-hidden`.

## Anti-Patterns

- **Flat diagrams pretending to be 3D.** If you can't commit to real isometric geometry, make a clean 2D schematic instead. Half-hearted perspective is worse than none.
- **Too many parts.** A figure with 40 parts is a visual inventory, not an explanation. 8–15 parts is the sweet spot; group minor parts into assemblies.
- **Labels inside parts.** Text on a small 3D face is unreadable. Always use external labels with leader lines.
- **Gradient abuse.** One linear gradient per face is fine for metallic sheen. Radial gradients on isometric faces break the illusion. Drop shadows are almost never correct in isometric projection.
- **Animating everything.** If interactive, only the parts that benefit from movement should move. The frame/base stays put.
