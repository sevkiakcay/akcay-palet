"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { CinematicTimeline } from "@/hooks/use-cinematic-timeline";
import { CINEMATIC_DURATION, formatTimecode, poseAt } from "@/lib/pallet/cinematic";
import { panelSwap, withoutMovement } from "@/lib/motion";

/**
 * Transport for the hero assembly tour: play/pause, scrubber, replay, and a
 * caption naming the current phase and the layer that is moving.
 *
 * Under `prefers-reduced-motion: reduce` (`tour.held`) the tour never plays on
 * its own. The play and replay buttons are not rendered — there is nothing to
 * start — and a short note says why; the scrubber stays, because dragging it is
 * motion the visitor makes, frame by frame.
 *
 * Motion owns only the caption's swap (mount/unmount). The wrapper may carry
 * `.gsap-reveal`, which GSAP fades in on scroll; nothing here animates that
 * node, so the two runtimes never meet on one property.
 */
export function PalletTourControls({ tour }: { tour: CinematicTimeline }) {
  const t = useTranslations("Builder.tour");
  const reduceMotion = useReducedMotion();
  const swap = reduceMotion ? withoutMovement(panelSwap) : panelSwap;

  const pose = poseAt(tour.displayTime);
  const phase = t(`phases.${pose.phase}`);
  const layer = pose.captionLayer ? t(`parts.${pose.captionLayer}`) : null;
  const caption = layer ? `${phase} · ${layer}` : phase;
  const now = formatTimecode(tour.displayTime);
  const total = formatTimecode(CINEMATIC_DURATION);

  return (
    <div className="mt-3 text-white">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-micro font-medium tracking-[0.12em] text-white/55 uppercase">{t("label")}</p>
        {/* Visual caption only: the slider's aria-valuetext carries the same
            words, so a live region here would just repeat them every second. */}
        <div aria-hidden className="min-h-[1.25em] text-end text-caption text-white/70">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={caption}
              className="inline-block"
              initial={swap.initial}
              animate={swap.animate}
              exit={swap.exit}
              transition={swap.transition}
            >
              {caption}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 [direction:ltr]">
        {!tour.held && (
          <>
            <button
              type="button"
              onClick={tour.togglePlay}
              aria-label={tour.playing ? t("pause") : t("play")}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-white/25 text-white transition duration-200 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.94]"
            >
              {tour.playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              type="button"
              onClick={tour.replay}
              aria-label={t("replay")}
              title={t("replay")}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-white/25 text-white transition duration-200 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.94]"
            >
              <ReplayIcon />
            </button>
          </>
        )}
        <input
          type="range"
          min={0}
          max={CINEMATIC_DURATION}
          step={0.1}
          value={tour.displayTime}
          onChange={(e) => tour.scrubTo(Number(e.currentTarget.value))}
          aria-label={t("timeline")}
          aria-valuetext={`${now} / ${total} — ${caption}`}
          className="h-1 min-w-0 flex-1 cursor-pointer accent-white"
        />
        <span className="shrink-0 font-mono text-nano tracking-[0.12em] text-white/60 tabular-nums">
          {now} / {total}
        </span>
      </div>

      {tour.held && <p className="mt-2 text-caption text-white/60">{t("held")}</p>}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M4.5 2.8v10.4L13 8z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M4 2.5h2.6v11H4zM9.4 2.5H12v11H9.4z" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8a5 5 0 1 0 1.6-3.7" strokeLinecap="round" />
      <path d="M3 2.5v2.8h2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
