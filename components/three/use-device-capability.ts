"use client";

import { useSyncExternalStore } from "react";

/**
 * The laser scene is a pure enhancement. Anyone who might be underserved by
 * it (reduced-motion, weak GPU/CPU, low memory, metered connection, or a
 * small touch device where it'd just cost battery) gets the static CSS
 * fallback instead - never a degraded/laggy version of the real thing.
 *
 * The device/GPU checks below don't change during a session, so they're
 * computed once and cached - useSyncExternalStore's snapshot function can be
 * called on every render, and creating a throwaway WebGL2 context each time
 * would be wasteful.
 */
let staticCapabilityCache: boolean | null = null;

function checkStaticCapability(): boolean {
  if (staticCapabilityCache !== null) return staticCapabilityCache;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  const isCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
  const isNarrowViewport = window.innerWidth < 640;

  staticCapabilityCache =
    !!gl &&
    !(nav.hardwareConcurrency && nav.hardwareConcurrency < 4) &&
    !(nav.deviceMemory && nav.deviceMemory < 4) &&
    !nav.connection?.saveData &&
    !(nav.connection?.effectiveType && /2g/.test(nav.connection.effectiveType)) &&
    !(isCoarsePointer && isNarrowViewport);

  return staticCapabilityCache;
}

function getSnapshot(): boolean {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  return checkStaticCapability();
}

function getServerSnapshot() {
  return false;
}

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

/**
 * useSyncExternalStore (rather than an effect + setState) reads this
 * browser-only capability without an extra post-mount render pass, and
 * gives us a correct SSR snapshot (always false) for free.
 */
export function useDeviceCapability() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
