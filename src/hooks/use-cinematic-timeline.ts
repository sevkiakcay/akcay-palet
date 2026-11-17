"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CINEMATIC_DURATION, clampTime } from "@/lib/pallet/cinematic";
import type { CinematicRef } from "@/components/pallet-workshop/PalletScene";

type Options = {
  /** False while the section is away from the viewport — the loop stops. */
  inView: boolean;
  /** False when WebGL failed or the scene isn't mounted; nothing should run. */
  enabled: boolean;
};

export type CinematicTimeline = {
  /** Handed to `PalletScene`; written at 60 fps without re-rendering React. */
  ref: CinematicRef;
  playing: boolean;
  /** Playhead for the readout and the caption. Updated ~10×/s, not per frame. */
  displayTime: number;
  togglePlay: () => void;
  scrubTo: (seconds: number) => void;
  replay: () => void;
  /** True when the visitor asked for less motion; the tour holds at 0 s. */
  held: boolean;
};

/** How often the React-visible playhead catches up with the real one. */
const DISPLAY_INTERVAL_MS = 100;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Last scrubbable instant; `CINEMATIC_DURATION` itself wraps to 0 s. */
const SCRUB_END = CINEMATIC_DURATION - 0.01;

/**
 * Drives the hero assembly tour's playhead.
 *
 * The playhead lives in a ref, not in state, because the scene reads it once
 * per frame: putting it in state would re-render the whole section sixty times
 * a second to move a number nobody reads that often. A separate, throttled
 * `displayTime` exists for the timecode and the caption, which do need React.
 *
 * Under `prefers-reduced-motion: reduce` the tour does not auto-play: it holds
 * at 0 s, the assembled pallet, and the play control is replaced by nothing —
 * the visitor can still scrub, because dragging a slider is motion they asked
 * for, frame by frame. The preference is about motion that happens *to* you.
 */
export function useCinematicTimeline({ inView, enabled }: Options): CinematicTimeline {
  const ref = useRef<{ time: number; replayNonce: number }>({ time: 0, replayNonce: 0 });
  const [held, setHeld] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION);
    const apply = () => {
      setHeld(mq.matches);
      if (mq.matches) {
        setPlaying(false);
        ref.current.time = 0;
        setDisplayTime(0);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // One loop, started only while the stage is on screen, the tour is playing
  // and the visitor hasn't asked for less motion. A 3D scene advancing a
  // timeline behind another section, or another tab, is pure battery drain.
  // `playing` is a dependency rather than a ref read inside the loop: pausing
  // simply tears the loop down, and resuming starts a fresh one whose first
  // step is measured from that moment, so the playhead never jumps.
  useEffect(() => {
    if (!enabled || !inView || held || !playing) return;
    // `held` arrives one commit after mount (it is read in an effect so the
    // server and client render the same markup). Checking the query here too
    // keeps the very first frame from advancing under `reduce`.
    if (window.matchMedia(REDUCED_MOTION).matches) return;
    // The ref's object is never replaced, only its fields are written.
    const playhead = ref.current;
    let raf = 0;
    let last = performance.now();
    let lastDisplay = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // Clamp the step so returning to a backgrounded tab doesn't jump the
      // playhead by however many seconds the tab was away.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.visibilityState === "visible") {
        playhead.time = clampTime(playhead.time + dt);
      }
      if (now - lastDisplay > DISPLAY_INTERVAL_MS) {
        lastDisplay = now;
        setDisplayTime(playhead.time);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      // Leave the readout exactly where the scene stopped.
      setDisplayTime(playhead.time);
    };
  }, [enabled, inView, held, playing]);

  const togglePlay = useCallback(() => setPlaying((v) => !v), []);

  // Dragging the slider pauses the tour: a playhead that keeps running under
  // the visitor's thumb fights them. The end is clamped, not wrapped, so
  // dragging to the far right shows the last frame instead of jumping to 0 s.
  const scrubTo = useCallback((seconds: number) => {
    const t = Number.isFinite(seconds) ? Math.min(Math.max(seconds, 0), SCRUB_END) : 0;
    ref.current.time = t;
    setDisplayTime(t);
    setPlaying(false);
  }, []);

  const replay = useCallback(() => {
    ref.current.time = 0;
    // Tells the scene to take the camera back from the visitor, if they took it.
    ref.current.replayNonce += 1;
    setDisplayTime(0);
    setPlaying(true);
  }, []);

  return { ref, playing, displayTime, togglePlay, scrubTo, replay, held };
}
