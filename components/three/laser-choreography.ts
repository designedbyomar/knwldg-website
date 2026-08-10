import { BEAT_DURATION, PULSE_BPM, getBeatPulse } from "./laser-pulse";

/**
 * The rig's show programme: a handful of named looks that cycle on a bar grid,
 * plus the path of the single spotlight.
 *
 * Everything here is a pure function of an absolute beat number, which is what
 * lets the WebGL scene and the DOM light pool render the same moment without
 * talking to each other (see laser-clock.ts).
 */

export const BEATS_PER_BAR = 4;
export const LOOK_BARS = 4; // ~7.3s per look at 132 BPM
export const LOOK_BARS_REDUCED = 8;
export const LOOK_CROSSFADE_BEATS = 2;
export const FAN_SPREAD = 2.9; // radians, edge to edge
export const SNAP_SLOTS = 7;
export const CHASE_REST = 0.06;

const TAU = Math.PI * 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function hash(n: number): number {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

/** -1..1 across the fan; 0 is the leftmost beam. */
function spread(i: number, n: number): number {
  return n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
}

export type BeamPose = { angle: number; intensity: number };
export type LookName = "fan" | "cross" | "wave" | "snap" | "chase" | "breathe";
type LookFn = (i: number, n: number, beat: number, out: BeamPose) => void;

/**
 * Every look writes an absolute angle from vertical inside +-FAN_SPREAD/2.
 * That shared invariant is what makes the naive lerp in sampleBeam safe: two
 * looks can never be more than a fan's width apart, so a crossfade reads as a
 * repositioning rather than a spin.
 */

/** Whole rig sweeps as one, 8-beat period. */
const fan: LookFn = (i, n, beat, out) => {
  out.angle = spread(i, n) * (FAN_SPREAD / 2) * 0.85 + Math.sin((beat / 8) * TAU) * 0.42;
  out.intensity = 0.55 + getBeatPulse(beat) * 0.45;
};

/** Alternating beams scissor through each other. */
const cross: LookFn = (i, n, beat, out) => {
  const dir = i % 2 === 0 ? 1 : -1;
  out.angle = spread(i, n) * (FAN_SPREAD / 2) * 0.45 + Math.sin((beat / 4) * TAU) * 0.55 * dir;
  out.intensity = 0.5 + getBeatPulse(beat) * 0.5;
};

/** Travelling sine down the rig. */
const wave: LookFn = (i, n, beat, out) => {
  const phase = (i / n) * TAU;
  out.angle = spread(i, n) * (FAN_SPREAD / 2) * 0.8 + Math.sin((beat / 3) * TAU + phase) * 0.3;
  out.intensity = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((beat / 2) * TAU + phase));
};

/** Hard 8th-note repositioning to hashed discrete slots. */
const snap: LookFn = (i, n, beat, out) => {
  const step = Math.floor(beat * 2);
  const slot = Math.floor(hash(step * 7.3 + i * 3.1) * SNAP_SLOTS);
  out.angle = (slot / (SNAP_SLOTS - 1) - 0.5) * FAN_SPREAD;
  out.intensity = getBeatPulse(beat * 2);
};

/** Static fan, one hot beam at a time. */
const chase: LookFn = (i, n, beat, out) => {
  out.angle = spread(i, n) * (FAN_SPREAD / 2);
  const step = Math.floor(beat * 2) % n;
  out.intensity = step === i ? 1 - ((beat * 2) % 1) * 0.7 : CHASE_REST;
};

/** Fan spread opens and closes over 4 bars. */
const breathe: LookFn = (i, n, beat, out) => {
  const open = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin((beat / 16) * TAU));
  out.angle = spread(i, n) * (FAN_SPREAD / 2) * open;
  out.intensity = 0.6 + 0.4 * (0.5 + 0.5 * Math.cos((beat / 16) * TAU));
};

export const LOOK_SEQUENCE = ["fan", "chase", "wave", "snap", "cross", "breathe"] as const;

const LOOKS: Record<LookName, LookFn> = { fan, cross, wave, snap, chase, breathe };

export function getLookBlend(beat: number, lookBars: number = LOOK_BARS) {
  const lookBeats = lookBars * BEATS_PER_BAR;
  const index = Math.floor(beat / lookBeats);
  const into = beat - index * lookBeats;
  const raw = (into - (lookBeats - LOOK_CROSSFADE_BEATS)) / LOOK_CROSSFADE_BEATS;

  return {
    from: LOOK_SEQUENCE[index % LOOK_SEQUENCE.length],
    to: LOOK_SEQUENCE[(index + 1) % LOOK_SEQUENCE.length],
    t: raw <= 0 ? 0 : raw >= 1 ? 1 : smoothstep(raw),
  };
}

// Scratch poses, fully consumed before sampleBeam returns - the frame loop is
// the only caller, so this keeps the per-frame allocation count at zero.
const scratchA: BeamPose = { angle: 0, intensity: 0 };
const scratchB: BeamPose = { angle: 0, intensity: 0 };

/**
 * The incoming look is sampled at the same absolute beat as the outgoing one,
 * so it arrives already mid-motion. Nothing restarts at a crossfade, which is
 * why the transitions don't pop.
 */
export function sampleBeam(
  i: number,
  n: number,
  beat: number,
  out: BeamPose,
  lookBars: number = LOOK_BARS
): BeamPose {
  const { from, to, t } = getLookBlend(beat, lookBars);

  LOOKS[from](i, n, beat, scratchA);
  if (t === 0) {
    out.angle = scratchA.angle;
    out.intensity = scratchA.intensity;
    return out;
  }

  LOOKS[to](i, n, beat, scratchB);
  out.angle = lerp(scratchA.angle, scratchB.angle, t);
  out.intensity = lerp(scratchA.intensity, scratchB.intensity, t);
  return out;
}

// --- Spotlight path -------------------------------------------------------

export const SPOT_BARS_X = 4;
export const SPOT_BARS_Y = 6;
/** lcm(SPOT_BARS_X, SPOT_BARS_Y) - the point at which the path repeats. */
export const SPOT_LOOP_BARS = 12;
export const SPOT_LOOP_SECONDS = SPOT_LOOP_BARS * BEATS_PER_BAR * BEAT_DURATION;
// The spot is aimed high and kept on a short leash. Its light is drawn as a
// focused disc behind the portrait, and the portrait's lower third is meant to
// dissolve into black - so the disc has to stay clear of that region entirely.
// At these values ny stays inside 0.26..0.54 instead of the old -0.18..0.50,
// which is what used to drop it onto his hands. On an 813px hero that puts the
// disc's centre between y=187 and y=301, above the y=358 line where the
// portrait starts going translucent.
//
// The X sweep is short for a different reason: a crisp disc sliding a long way
// reads as a roaming blob, where a small drift reads as a planted light
// breathing on the beat.
export const SPOT_SWEEP_X = 0.3;
export const SPOT_SWEEP_Y = 0.14;
export const SPOT_CENTER_Y = 0.4;
export const SPOT_FLOOR = 0.45;

export type SpotPose = { nx: number; ny: number; intensity: number };

/**
 * Which of the two fixtures a caller is sampling.
 *
 * "counter" is the same path mirrored horizontally *and* inverted vertically,
 * so the pair sweeps toward each other, crosses near the middle and separates,
 * rather than sitting stacked on top of one another. Inverting around
 * SPOT_CENTER_Y rather than around zero is what keeps it inside the same safe
 * band - the whole point of SPOT_CENTER_Y is that neither fixture may dip into
 * the portrait's fade region.
 *
 * Intensity is deliberately *not* mirrored: the two breathe together, on the
 * same beat, as one rig.
 */
export type SpotChannel = "lead" | "counter";

/**
 * The pose reduced-motion callers park at: a quarter of the way through the X
 * sweep, where nx is at its extreme. Parking at beat 0 instead would put both
 * fixtures at nx = 0 - stacked on the same point, reading as one light.
 */
export const SPOT_PARK_BEAT = BEATS_PER_BAR;

/**
 * Normalised hero coordinates in -1..1, +y up. Deliberately unitless: the
 * WebGL cone scales it by world half-extents and the DOM pool by pixel
 * half-extents, from one source of truth.
 */
export function sampleSpot(
  beat: number,
  out: SpotPose,
  channel: SpotChannel = "lead"
): SpotPose {
  const bar = beat / BEATS_PER_BAR;
  const mirror = channel === "counter" ? -1 : 1;

  out.nx = mirror * Math.sin((bar / SPOT_BARS_X) * TAU) * SPOT_SWEEP_X;
  out.ny =
    SPOT_CENTER_Y + mirror * Math.sin((bar / SPOT_BARS_Y) * TAU + 1.1) * SPOT_SWEEP_Y;
  out.intensity = SPOT_FLOOR + (1 - SPOT_FLOOR) * (0.5 + 0.5 * Math.cos((bar / 3) * TAU));
  return out;
}

// --- Strobe ---------------------------------------------------------------

export const STROBE_PERIOD_BARS = 8; // one burst every ~14.6s
export const STROBE_BURST_BARS = 2; // burst runs ~3.6s
export const STROBE_FLASHES_PER_BEAT = 1;
/** Fraction of each flash cycle the light is on. */
export const STROBE_DUTY = 0.45;

/**
 * The strobe's flash rate, in Hz.
 *
 * This is a hard ceiling, not a preference. WCAG 2.3.1 allows no more than
 * three flashes in any one-second period, and the whole rig is already built
 * around that limit - see PULSE_BPM, which was picked at 132 for exactly this
 * reason. One flash per beat is 2.2Hz. Setting STROBE_FLASHES_PER_BEAT to 2
 * would be 4.4Hz and fail, on an element covering most of the viewport.
 *
 * If a burst needs more punch, reach for STROBE_DUTY, STROBE_BURST_BARS, or how
 * deep the gate cuts. Not this.
 */
export const STROBE_HZ = (STROBE_FLASHES_PER_BEAT * PULSE_BPM) / 60;

/**
 * 1 while lit, 0 while gated, and always 1 outside a burst window.
 *
 * A square wave on purpose - real strobes don't ease. The burst occupies the
 * *last* STROBE_BURST_BARS of each period so it reads as a fill running into
 * the next phrase rather than as a random interruption.
 *
 * Pure function of the absolute beat, same contract as sampleSpot and
 * sampleBeam, so every layer that gates on it stays in sync for free.
 */
export function sampleStrobe(beat: number): number {
  const periodBeats = STROBE_PERIOD_BARS * BEATS_PER_BAR;
  const burstBeats = STROBE_BURST_BARS * BEATS_PER_BAR;
  const into = beat - Math.floor(beat / periodBeats) * periodBeats;
  if (into < periodBeats - burstBeats) return 1;

  const phase = (into * STROBE_FLASHES_PER_BEAT) % 1;
  return phase < STROBE_DUTY ? 1 : 0;
}
