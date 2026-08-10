import { BEAT_DURATION } from "./laser-pulse";

/**
 * A wall-clock beat shared by the WebGL rig and the DOM glow that tracks it.
 *
 * Deliberately not THREE.Clock: R3F flips frameloop to "never" when the hero
 * scrolls out or the tab hides, and THREE.Clock stops accumulating while
 * paused - so it drifts further from wall time on every pause. The DOM glow
 * runs on its own rAF and would slide out of sync with the beams. Reading
 * performance.now() against a fixed epoch means both sides are the same number
 * by construction rather than by synchronisation, and the rig simply resumes at
 * the pose it would have been in.
 */
const EPOCH = typeof performance === "undefined" ? 0 : performance.now();

export function getLaserSeconds(): number {
  return (performance.now() - EPOCH) / 1000;
}

export function getLaserBeat(): number {
  return getLaserSeconds() / BEAT_DURATION;
}
