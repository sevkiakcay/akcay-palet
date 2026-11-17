# Akçay Palet — Design System

The tokens live in `src/app/globals.css`. This file says what each one is for and
why it has the value it has, so later edits stay inside the system instead of
adding another ad-hoc value beside it.

Everything here is Tailwind v4 `@theme inline`, so a token named `--text-small`
is usable as `text-small`, `--container-editorial` as `max-w-editorial`, and so
on. There is no `tailwind.config.*` in this project.

## Colour

Two token sets exist side by side. This is deliberate and temporary.

### Editorial (current direction)

The monopo.vn-referenced set the public marketing sections use. Pure black and
white plus a four-step grey ramp.

| Token | Value | Use |
| --- | --- | --- |
| `--editorial-bg` | `#ffffff` | page ground on light sections |
| `--editorial-ink` | `#000000` | ground on dark sections, ink on light |
| `--editorial-gray-1` | `#181818` | near-ink text |
| `--editorial-gray-2` | `#636363` | secondary text |
| `--editorial-gray-3` | `#808080` | tertiary text, hairlines |
| `--editorial-gray-4` | `#9a9a9a` | disabled, faint rules |

Three accent colours — `--editorial-sage`, `--editorial-amber`,
`--editorial-oxblood` — exist for the hero media gradient only. They are not UI
colours and must not be used as one.

**The ink and the paper are written as `black` and `white`, not as tokens.**
Across the thirteen editorial sections, Tailwind's own `black`/`white` (and
their alpha variants) appear ~126 times; `bg-editorial-ink` appears once. This
is the convention, not drift — every section agrees, and `--editorial-ink` /
`--editorial-bg` are exactly `#000000` / `#ffffff`, so the token buys only
indirection today. Do not "fix" these call sites: the churn is large, the
visual change is nil, and there is no behaviour to gain.

What the tokens are genuinely for is the **grey ramp** — `text-editorial-gray-2`
and `-gray-3` carry secondary and tertiary copy on white grounds, and that is
where a brand change would actually need one lever. If the ink ever moves off
pure black (the brief floats graphite `#161616`), that is the point to convert
the ink and paper call sites in one deliberate pass, not before.

On dark sections, prefer `white/<alpha>` over the grey ramp: the ramp is tuned
for white grounds, and a mid grey on black fails contrast — the legacy
`--muted-foreground` measured 2.81:1 on the FinalCta panel, well under the
4.5:1 AA floor, which is what sent `QuoteForm` to the values below.

Measured against pure black; a panel tinted `white/[0.03]` costs ~0.3:

| Value | Contrast | Verdict |
| --- | --- | --- |
| `white/40` | 3.66:1 | inactive / decorative only, never body text |
| `white/50` | 5.28:1 | passes AA for normal text |
| `white/60` | 7.37:1 | secondary text |
| `white/70` | 9.96:1 | body text |

### Legacy copper (being retired)

The original warm-industrial oklch set: `--primary` (copper
`oklch(0.5 0.14 40)`), `--primary-bright`, `--surface-dark`, `--background`,
`--muted-foreground` and the rest of the shadcn token block.

Still consumed by the pallet workshop (`PalletWorkshop`, `QuoteDialog`,
`TopBoardEditor`). Those are the last holders; the tokens get deleted only after
a grep confirms zero remaining references, the same way the legacy
`.frame-open`/`.reveal` CSS was removed earlier in this project.

`ui/button.tsx` reads these tokens but is imported nowhere — it is dead code,
not a migration target.

## Typography

Two self-hosted families, loaded in `src/app/[locale]/layout.tsx` from
`@fontsource` packages so builds need no network.

| Role | Family | Token |
| --- | --- | --- |
| Body | Inter Variable | `--font-geist-sans` → `font-sans` |
| Headings | Space Grotesk 500/600/700 | `--font-display` → `font-heading` |
| Mono | Geist Mono Variable | `--font-geist-mono` → `font-mono` |
| Arabic | Noto Sans Arabic | `--font-arabic` |

Per-language swaps are in `globals.css`: `html:lang(el)` and `html:lang(ru)`
drop headings to Inter (Space Grotesk has no Greek or Cyrillic glyphs);
`html:lang(ar)` moves everything to Noto Sans Arabic and zeroes letter-spacing,
which breaks the joined script.

### Scale

Derived from what the sections already rendered, not from a generic modular
ratio. Every token reproduces the exact endpoints of a role that existed as an
ad-hoc `text-[Npx]` before the scale, with one deliberate change: the heading
tier is fluid, so a headline grows continuously instead of stepping at `md`.

**No token carries a paired line-height.** Sections set leading explicitly
(`leading-[0.95]`, `leading-[1.02]`…) and pairing a default would silently
restyle every call site that doesn't. Tailwind's own `text-base` does carry one,
which is why 16px has its own `--text-md` token instead.

| Token | Value | Role |
| --- | --- | --- |
| `text-nano` | 10px | axis ticks, board badges |
| `text-micro` | 11px | uppercase labels, step indicators |
| `text-caption` | 12px | form labels, small meta |
| `text-small` | 13px | secondary body — most used size on the site |
| `text-ui` | 14px | controls, spec rows |
| `text-body` | 15px | body copy |
| `text-md` | 16px | step titles |
| `text-body-lg` | 17px | lead paragraphs |
| `text-subtitle` | 18px | dialog and panel sub-headings |
| `text-lead` | 19px | hero sub-copy at `lg` |
| `text-title` | 22px | dialog titles |
| `text-section` | `clamp(29px, 4.2vw, 46px)` | section openers |
| `text-statement` | `clamp(40px, 9vw, 74px)` | closing statement (FinalCta) |
| `text-display-sm` | `clamp(2.5rem, 6vw, 72px)` | StatsSection |
| `text-display` | `clamp(2.25rem, 7vw, 78px)` | HeroTransition |
| `text-display-lg` | `clamp(2.25rem, 8vw, 96px)` | ProductsIntro |
| `text-mega` | `clamp(2.5rem, 14vw, 225px)` | hero only |

`text-section` is one role, not six. Six sections opened with six
near-identical ad-hoc pairs — 28/40, 29/38, 29/42, 31/46, 33/46, 33/46 — that
had drifted apart rather than been designed apart. They are unified; the
endpoints keep the widest of the set, so no headline shrank on desktop.

There are no remaining `text-[Npx]` values in `src/`. Adding one is a
regression: add a token, or use the role that fits.

## Layout

| Token | Value | Use |
| --- | --- | --- |
| `--container-editorial` | 1078px | the content width, as `max-w-editorial` |
| `--grid-gutter` | 1.5rem | horizontal gutter, mobile |
| `--grid-gutter-md` | 2rem | horizontal gutter, `md` and up |

Two utilities compose these:

- `editorial-shell` — centred, capped at the container, with the page gutter.
  Replaces the `mx-auto max-w-[1078px] px-6` triplet. Use this for a section's
  content wrapper when the section itself has no horizontal padding.
- `editorial-grid` — a 12-column track with the responsive gutter. Columns are
  addressed with Tailwind's own `col-span-*` / `col-start-*`; there are no
  bespoke column utilities.

1078px was not chosen here — twelve call sites had already converged on it. It
is now the container rather than a repeated magic number.

Sections that still use `grid-cols-2` / `grid-cols-3` with their own gaps were
left alone: converting them to the 12-column track would change their gutters,
and that is a visual change that needs a browser to confirm. New sections should
use `editorial-grid`.

### Vertical rhythm

| Token | Value | Use |
| --- | --- | --- |
| `--spacing-section` | 6rem | light sections (`py-section`) |
| `--spacing-section-lg` | 9rem | dark sections (`py-section-lg`) |

### Breakpoints

Tailwind defaults. Current usage is `md:` 45, `sm:` 16, `lg:` 12, `xl:` 9 — so
desktop refinement above `md` is thin, and layouts above 1440px have had little
attention. Worth addressing when a section is next touched.

## Radius

`--radius: 0.625rem` with a derived scale (`--radius-sm` … `--radius-4xl`), plus
`--radius-pill: 75px` for the editorial pill buttons, which are the site's
primary CTA shape (`bg-white text-black rounded-pill` on dark grounds).

## Motion

Easing is a single source of truth shared between CSS and GSAP. The three
`cubic-bezier` values in `globals.css` are mirrored as GSAP `CustomEase`
instances in `src/lib/gsap.ts` under the names `motionEase`, `motionEaseInOut`
and `editorialEase`, so a GSAP tween curves identically to the CSS transition
beside it. Changing one means changing both.

| Token | Value | Utility |
| --- | --- | --- |
| `--motion-ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-precise` |
| `--motion-ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | — |
| `--editorial-ease` | `cubic-bezier(0.19, 1, 0.22, 1)` | `ease-editorial` |

Which library owns which animation is in `docs/motion-plan.md`.
