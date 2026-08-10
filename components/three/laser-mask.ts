import type { CSSProperties } from "react";

// Shared between the WebGL canvas layer and its CSS-only fallback so both clip
// to the same measured boundary (see the ResizeObserver in
// laser-hero-scene-loader.tsx, which writes --laser-cutoff onto the <section>).
//
// Both offsets are measured *up* from the portrait's bottom edge.
//
// Deliberately a gentle band. Hiding beams behind the portrait's translucent
// lower half is the black floor scrim's job (see the --hero-fade-start layer in
// hero.tsx), not this mask's - the mask only has to stop beams before they
// reach the copy below. Making it do the occluding meant starting the fade
// 220px up, which put the beam emitter itself inside the band and forced the
// whole fan to originate from above his head.
export const LASER_FADE_START_PX = 140;
export const LASER_FADE_END_PX = 40;

const MASK_GRADIENT = [
  "linear-gradient(to bottom, black 0px,",
  `black calc(var(--laser-cutoff, 100%) - ${LASER_FADE_START_PX}px),`,
  `transparent calc(var(--laser-cutoff, 100%) - ${LASER_FADE_END_PX}px))`,
].join(" ");

export const LASER_MASK_STYLE: CSSProperties = {
  WebkitMaskImage: MASK_GRADIENT,
  maskImage: MASK_GRADIENT,
};
