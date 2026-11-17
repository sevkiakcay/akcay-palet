import type { PartKind } from "./model";

/**
 * The hero assembly tour: a deterministic, reversible 21-second timeline that
 * takes a finished pallet apart along its real build order and puts it back
 * together.
 *
 * Two rules make it work, and both are load-bearing:
 *
 * 1. **Everything is a function of the playhead.** Every offset, every camera
 *    value comes from one `t` in 0–21 s. Nothing accumulates frame to frame,
 *    so dragging the scrubber backwards is as correct as playing forwards, and
 *    a dropped frame can never leave the model drifted. This is why
 *    `partOffset` returns an absolute offset from the part's home position
 *    rather than a delta to add.
 *
 * 2. **The order is the content.** Layers do not scatter randomly: the top deck
 *    lifts off first, like a lid, and on the way back the bottom deck lands
 *    first, then the blocks or stringers, then the cross bearers, then the top
 *    deck. That is the order a pallet is actually built in, so the animation
 *    carries real information instead of being decoration.
 *
 * No invented telemetry lives here. The captions name parts using the same
 * Turkish terms the workshop UI already uses (`Workshop.groups` in
 * `messages/*.json`): üst tabla, bağlantı tahtası, takoz, kızak, alt tabla.
 */

export const CINEMATIC_DURATION = 21;

/** Phases exist for the caption and the control labels, not for the maths. */
export type CinematicPhase = "assembled" | "separating" | "apart" | "assembling" | "finished";

type Keyframe = readonly [t: number, value: number];

/** Smoothstep between surrounding keys; flat outside the first and last. */
function sample(keys: readonly Keyframe[], t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (t >= last[0]) return last[1];
  for (let i = 1; i < keys.length; i++) {
    const [bt, bv] = keys[i];
    if (t > bt) continue;
    const [at, av] = keys[i - 1];
    if (bt === at) return bv;
    const u = (t - at) / (bt - at);
    return av + (bv - av) * (u * u * (3 - 2 * u));
  }
  return last[1];
}

/**
 * One separation curve per layer, 0 = home, 1 = fully apart.
 *
 * Out (≈3–7 s): the top deck goes first, the bottom deck last — the pallet
 * opens from above. Hold apart to 12 s. Back (≈12–16 s): strict build order,
 * bottom deck first and top deck last, so the return reads as assembly rather
 * than as the separation played in reverse.
 */
const SEPARATION: Record<PartKind, readonly Keyframe[]> = {
  top: [[0, 0], [3.0, 0], [6.0, 1], [12.0, 1], [14.9, 1], [16.2, 0], [CINEMATIC_DURATION, 0]],
  cross: [[0, 0], [3.2, 0], [6.3, 1], [12.0, 1], [14.0, 1], [15.1, 0], [CINEMATIC_DURATION, 0]],
  block: [[0, 0], [3.4, 0], [6.6, 1], [12.0, 1], [13.0, 1], [14.3, 0], [CINEMATIC_DURATION, 0]],
  stringer: [[0, 0], [3.4, 0], [6.6, 1], [12.0, 1], [13.0, 1], [14.3, 0], [CINEMATIC_DURATION, 0]],
  bottom: [[0, 0], [3.6, 0], [6.9, 1], [12.0, 1], [12.2, 1], [13.4, 0], [CINEMATIC_DURATION, 0]],
};

/**
 * How far each layer travels when fully apart, in model millimetres (the scene
 * scales by 0.001 afterwards). Stacked in build order so the apart state reads
 * as an exploded assembly drawing: the bottom deck holds the ground line and
 * everything above it climbs.
 */
const LIFT: Record<PartKind, number> = {
  bottom: 0,
  block: 300,
  stringer: 300,
  cross: 470,
  top: 660,
};

/**
 * Lateral fan within a layer, so boards that sit flush when assembled don't
 * overlap when apart. Deterministic from the part's index — not random, or the
 * pose would differ between two renders of the same `t`.
 */
const FAN: Record<PartKind, number> = {
  top: 54,
  cross: 40,
  block: 30,
  stringer: 30,
  bottom: 54,
};

const CAMERA_DISTANCE: readonly Keyframe[] = [
  [0, 1.0],
  [3, 1.0],
  [6.5, 1.42],
  [12, 1.46],
  // Hold wide until the top deck starts landing (14.9 s): zooming in while it
  // is still lifted pushed the landed layers against the bottom of the frame.
  [14.9, 1.42],
  [16.5, 1.04],
  [CINEMATIC_DURATION, 1.0],
];

/** Radians. A slow drift while assembled, a wider sweep while apart. */
const CAMERA_AZIMUTH: readonly Keyframe[] = [
  [0, 0],
  [3, 0.22],
  [7, 0.75],
  [12, -0.55],
  [16.5, -0.12],
  [CINEMATIC_DURATION, 0],
];

/** Radians above the horizon. Rises while apart so the layers read as stacked. */
const CAMERA_ELEVATION: readonly Keyframe[] = [
  [0, 0],
  [3, 0.02],
  [7, 0.3],
  [12, 0.26],
  [16.5, 0.03],
  [CINEMATIC_DURATION, 0],
];

/**
 * The layer the caption names, by phase. While separating, the layer currently
 * leaving; while assembling, the layer currently landing. `null` when the
 * pallet is whole and there is nothing to point at.
 */
function captionLayer(t: number): PartKind | null {
  if (t >= 3.0 && t < 6.9) {
    if (t < 4.0) return "top";
    if (t < 5.0) return "cross";
    if (t < 6.0) return "block";
    return "bottom";
  }
  if (t >= 12.2 && t < 16.3) {
    if (t < 13.4) return "bottom";
    if (t < 14.3) return "block";
    if (t < 15.1) return "cross";
    return "top";
  }
  return null;
}

export function phaseAt(t: number): CinematicPhase {
  if (t < 3) return "assembled";
  if (t < 7) return "separating";
  if (t < 12) return "apart";
  if (t < 16.3) return "assembling";
  return "finished";
}

export type CinematicCamera = {
  /** Multiplier on the scene's own framing distance, not an absolute position. */
  distance: number;
  azimuth: number;
  elevation: number;
  /**
   * How far to raise the aim point above the assembled pallet's centre, in
   * model millimetres. The exploded stack grows upward only (the bottom deck
   * holds the ground line), so its centre climbs with it; aiming at the
   * assembled centre left the lifted top deck touching, then leaving, the top
   * of the frame. Half the top deck's lift keeps the stack centred.
   */
  targetLift: number;
};

export type CinematicPose = {
  camera: CinematicCamera;
  phase: CinematicPhase;
  /** Part to name in the caption, or `null` while the pallet is whole. */
  captionLayer: PartKind | null;
  /** 0 when fully assembled, 1 at maximum separation — for progress UI only. */
  openness: number;
};

export function poseAt(time: number): CinematicPose {
  const t = clampTime(time);
  return {
    camera: {
      distance: sample(CAMERA_DISTANCE, t),
      azimuth: sample(CAMERA_AZIMUTH, t),
      elevation: sample(CAMERA_ELEVATION, t),
      targetLift: (LIFT.top * sample(SEPARATION.top, t)) / 2,
    },
    phase: phaseAt(t),
    captionLayer: captionLayer(t),
    openness: sample(SEPARATION.top, t),
  };
}

/**
 * Absolute offset from a part's home position, in model millimetres.
 *
 * `index` is the part's position within its own layer and only drives the
 * lateral fan, so two parts of the same kind never land on top of each other
 * when apart. Pure: same arguments, same result, every time.
 */
export function partOffset(
  kind: PartKind,
  index: number,
  countInLayer: number,
  time: number,
): { x: number; y: number; z: number } {
  const amount = sample(SEPARATION[kind], clampTime(time));
  if (amount === 0) return ZERO;
  const lift = LIFT[kind] * amount;
  // Centre the fan on the layer, so the stack stays visually balanced.
  const centre = (countInLayer - 1) / 2;
  const fan = countInLayer > 1 ? ((index - centre) / Math.max(centre, 1)) * FAN[kind] * amount : 0;
  // Blocks and stringers fan across Z; decks fan across X. Keeps each layer
  // spreading along its own short axis rather than all four spreading the same
  // way, which would hide the lower layers behind the upper ones.
  const acrossZ = kind === "block" || kind === "stringer";
  return {
    x: acrossZ ? 0 : fan,
    y: lift,
    z: acrossZ ? fan : 0,
  };
}

const ZERO = { x: 0, y: 0, z: 0 } as const;

export function clampTime(t: number): number {
  if (!Number.isFinite(t)) return 0;
  if (t < 0) return 0;
  return t % CINEMATIC_DURATION;
}

/**
 * `m:ss` for the scrubber readout. Clamped rather than wrapped, so the total
 * (`CINEMATIC_DURATION` itself) reads 0:21 instead of 0:00.
 */
export function formatTimecode(t: number): string {
  const whole = Number.isFinite(t) ? Math.floor(Math.min(Math.max(t, 0), CINEMATIC_DURATION)) : 0;
  return `0:${String(whole).padStart(2, "0")}`;
}
