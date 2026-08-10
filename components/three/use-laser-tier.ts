"use client";

import { useSyncExternalStore } from "react";

/**
 * How much laser rig this device should get.
 *
 * "off"     - static CSS fallback only (reduced motion, no WebGL2, weak hardware)
 * "reduced" - the real rig, trimmed: fewer beams, no post-processing pass
 * "full"    - everything
 *
 * A string union rather than a config object on purpose: useSyncExternalStore
 * compares snapshots by identity, and a fresh object every call would loop.
 */
export type LaserTier = "off" | "reduced" | "full";

export const TIER_SETTINGS = {
  full: {
    beamCount: 9,
    dpr: [1, 1.75] as [number, number],
    bloom: true,
    coreGain: 3.0,
    haloGain: 0.85,
    lookBars: 4,
  },
  reduced: {
    beamCount: 5,
    dpr: [1, 1.25] as [number, number],
    bloom: false,
    // No composer means an 8-bit framebuffer that clamps at 1.0, so there is no
    // headroom for an HDR core and nothing to catch the overflow. Pull the core
    // down and lift the halo to compensate for the missing bloom.
    coreGain: 1.25,
    haloGain: 1.05,
    lookBars: 8,
  },
} as const;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER = "(pointer: coarse)";
const NARROW_VIEWPORT = "(max-width: 767px)";

/**
 * Only genuinely immutable facts are cached. Viewport and pointer queries used
 * to be baked into this same cache, which meant a window resized from phone to
 * desktop width could never recover the rig for the rest of the session.
 */
let hardwareFloor: "off" | "ok" | null = null;

function getHardwareFloor(): "off" | "ok" {
  if (hardwareFloor !== null) return hardwareFloor;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  const ok =
    !!gl &&
    !(nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) &&
    !(nav.deviceMemory !== undefined && nav.deviceMemory < 4) &&
    !nav.connection?.saveData &&
    !/(^|-)2g$/.test(nav.connection?.effectiveType ?? "");

  // Release the probe context rather than leaving it to the GC - browsers cap
  // live WebGL contexts fairly aggressively.
  gl?.getExtension("WEBGL_lose_context")?.loseContext();

  hardwareFloor = ok ? "ok" : "off";
  return hardwareFloor;
}

function getSnapshot(): LaserTier {
  if (window.matchMedia?.(REDUCED_MOTION).matches) return "off";
  if (getHardwareFloor() === "off") return "off";

  const coarse = window.matchMedia?.(COARSE_POINTER).matches;
  const narrow = window.matchMedia?.(NARROW_VIEWPORT).matches;
  const fewCores = (navigator.hardwareConcurrency ?? 8) < 6;

  return coarse || narrow || fewCores ? "reduced" : "full";
}

function getServerSnapshot(): LaserTier {
  return "off";
}

function subscribe(onChange: () => void) {
  const queries = [REDUCED_MOTION, COARSE_POINTER, NARROW_VIEWPORT].map((q) =>
    window.matchMedia(q)
  );
  queries.forEach((q) => q.addEventListener("change", onChange));
  return () => queries.forEach((q) => q.removeEventListener("change", onChange));
}

export function useLaserTier(): LaserTier {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
