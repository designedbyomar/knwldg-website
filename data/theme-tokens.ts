import { clampChroma, converter } from "culori";

const toRgb = converter("rgb");

export type RgbTuple = [r: number, g: number, b: number];

/**
 * Gamut-maps into sRGB before converting. Every stop on the brand ramp
 * (L=0.78 C=0.19) sits outside sRGB, so a raw conversion returns channels
 * above 1.0 that silently clamp - which flattened all five hues toward the
 * same pale blue-white. clampChroma holds hue and lightness and drops only
 * chroma, which is what keeps the stops distinguishable from each other.
 */
export function oklchToSrgbTuple(oklchString: string): RgbTuple {
  const rgb = toRgb(clampChroma(oklchString, "oklch", "rgb"));
  if (!rgb) return [1, 1, 1];
  return [rgb.r, rgb.g, rgb.b];
}

function srgbToLinearChannel(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Scene-referred (linear) light. This is the only form that may be written to
 * gl_FragColor: three renders in a linear working space and encodes to sRGB on
 * the way out, so handing it display-referred values encodes them twice.
 */
export function srgbTupleToLinear([r, g, b]: RgbTuple): RgbTuple {
  return [srgbToLinearChannel(r), srgbToLinearChannel(g), srgbToLinearChannel(b)];
}

export const BRAND_ULTRAVIOLET_OKLCH = "oklch(0.78 0.19 260)";
export const BRAND_VIOLET_OKLCH = "oklch(0.78 0.19 280)";
export const BRAND_ORCHID_OKLCH = "oklch(0.78 0.19 300)";
export const BRAND_MAGENTA_OKLCH = "oklch(0.78 0.19 320)";
export const BRAND_ROSE_OKLCH = "oklch(0.78 0.19 340)";

const RAMP_OKLCH = [
  BRAND_ULTRAVIOLET_OKLCH,
  BRAND_VIOLET_OKLCH,
  BRAND_ORCHID_OKLCH,
  BRAND_MAGENTA_OKLCH,
  BRAND_ROSE_OKLCH,
] as const;

/** Display-referred sRGB, 0-1. For canvas 2D / CSS interop. */
export const BRAND_RAMP_SRGB: RgbTuple[] = RAMP_OKLCH.map(oklchToSrgbTuple);

/** Linear light, 0-1. For WebGL shaders. */
export const BRAND_RAMP_LINEAR: RgbTuple[] = BRAND_RAMP_SRGB.map(srgbTupleToLinear);

/** Magenta -> violet hue ramp used for the events grid indices (01-05). */
export const EVENT_HUE_RAMP = [340, 320, 300, 280, 260] as const;

export function hueRampOklch(hue: number) {
  return `oklch(0.78 0.19 ${hue})`;
}
