import { converter } from "culori";

const toRgb = converter("rgb");

export type RgbTuple = [r: number, g: number, b: number];

function oklchToRgbTuple(oklchString: string): RgbTuple {
  const rgb = toRgb(oklchString);
  if (!rgb) return [1, 1, 1];
  return [rgb.r, rgb.g, rgb.b];
}

export const BRAND_MAGENTA_OKLCH = "oklch(0.78 0.19 320)";
export const BRAND_VIOLET_OKLCH = "oklch(0.78 0.19 280)";
export const BRAND_INDIGO_OKLCH = "oklch(0.8 0.09 275)";

export const BRAND_MAGENTA_RGB = oklchToRgbTuple(BRAND_MAGENTA_OKLCH);
export const BRAND_VIOLET_RGB = oklchToRgbTuple(BRAND_VIOLET_OKLCH);

/** Magenta -> violet hue ramp used for the events grid indices (01-05). */
export const EVENT_HUE_RAMP = [320, 310, 300, 290, 280] as const;

export function hueRampOklch(hue: number) {
  return `oklch(0.78 0.19 ${hue})`;
}
