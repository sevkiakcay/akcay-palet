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

type Timeline = {
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
export function useCinematicTimeline({ inView, enabled }: Options): Timeline {
  const ref = useRef<{ time: number; replayNonce: number }>({ time: 0, replayNonce: 0 });
  const [held, setHeld] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [displayTime, setDisplayTime] = useState(0);
  // Read inside the loop so toggling play doesn't restart the effect.
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
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

  // One loop, started only when the section is actually on screen and the tab
  // is visible. A 3D scene advancing a timeline behind another tab is pure
  // battery drain.
  useEffect(() => {
    if (!enabled || !inView || held) return;
    let raf = 0;
    let last = performance.now();
    let lastDisplay = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // Clamp the step so returning to a backgrounded tab doesn't jump the
      // playhead by however many seconds the tab was away.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playingRef.current && document.visibilityState === "visible") {
        ref.current.time = clampTime(ref.current.time + dt);
      }
      if (now - lastDisplay > DISPLAY_INTERVAL_MS) {
        lastDisplay = now;
        setDisplayTime(ref.current.time);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled, inView, held]);

  const togglePlay = useCallback(() => setPlaying((v) => !v), []);

  const scrubTo = useCallback((seconds: number) => {
    const t = clampTime(seconds);
    ref.current.time = t;
    setDisplayTime(t);
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

export { CINEMATIC_DURATION };
