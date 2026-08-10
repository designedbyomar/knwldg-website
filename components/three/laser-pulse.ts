// Simulated beat clock driving the laser rig's pulse and its DOM counterpart.
export const PULSE_BPM = 132; // 2.2Hz, below the WCAG 2.3.1 3Hz flash threshold
export const PULSE_FLOOR = 0.42; // dim-between-hits floor, not a full blackout
export const BEAT_DURATION = 60 / PULSE_BPM;

/**
 * Beat-domain pulse: a hit on the downbeat decaying to PULSE_FLOOR. Everything
 * in the rig works in beats rather than seconds so a look can be described as
 * "one sweep every 8 beats" and stay musical if the BPM ever moves.
 */
export function getBeatPulse(beat: number): number {
  const beatPhase = beat - Math.floor(beat);
  return PULSE_FLOOR + (1 - PULSE_FLOOR) * Math.pow(1 - beatPhase, 2.2);
}

export function getPulse(time: number): number {
  return getBeatPulse(time / BEAT_DURATION);
}
