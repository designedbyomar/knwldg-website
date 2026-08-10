"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { getLaserBeat } from "@/components/three/laser-clock";
import {
  SPOT_PARK_BEAT,
  sampleSpot,
  sampleStrobe,
  type SpotChannel,
  type SpotPose,
} from "@/components/three/laser-choreography";
import { useLaserTier } from "@/components/three/use-laser-tier";
import { PORTRAIT_FADE_MASK } from "./hero-fade";

/**
 * Each fixture is described by two hues: the colour at its core and the colour
 * its falloff lands on. Every gradient below walks between them, so adding a
 * fixture is a matter of naming two numbers rather than hand-writing stops.
 *
 * "lead" is violet rolling off to ultraviolet, deliberately away from the
 * wordmark's pink end - the mark's own gradient runs blue to pink, so a magenta
 * backdrop made its right half disappear.
 *
 * "counter" is the rose the brief asked for. #ff81dd converts to
 * oklch(0.774 0.186 338.6), which is within rounding of the --color-rose token
 * already in the palette, so it is expressed as that hue rather than as a
 * one-off hex.
 */
const CHANNEL_HUES: Record<SpotChannel, { core: number; edge: number }> = {
  lead: { core: 280, edge: 260 },
  counter: { core: 340, edge: 320 },
};

/** Walk from the core hue toward the edge hue. */
const hue = (h: { core: number; edge: number }, t: number) =>
  Math.round(h.core + (h.edge - h.core) * t);

/**
 * The backdrop disc. Flat to 68% of the radius and then the whole roll-off
 * inside the last third, which is what makes it read as light landing on a wall
 * rather than as fog.
 */
const discGradient = (h: { core: number; edge: number }) =>
  [
    "radial-gradient(closest-side circle,",
    `oklch(0.78 0.19 ${h.core} / 0.95),`,
    `oklch(0.76 0.19 ${hue(h, 0.4)} / 0.9) 68%,`,
    `oklch(0.74 0.19 ${hue(h, 0.8)} / 0.8) 84%,`,
    `oklch(0.62 0.17 ${h.edge} / 0.45) 91%,`,
    `oklch(0.45 0.13 ${h.edge} / 0.18) 96%,`,
    "transparent)",
  ].join(" ");

/**
 * Bleeds past the disc's edge so it doesn't read as a pasted shape. Kept weak
 * on purpose - anything stronger starts lifting the blacks the portrait's
 * bottom fade needs to dissolve into.
 */
const haloGradient = (h: { core: number; edge: number }) =>
  [
    "radial-gradient(closest-side circle,",
    `oklch(0.62 0.18 ${hue(h, 0.6)} / 0.3),`,
    `oklch(0.5 0.15 ${hue(h, 0.9)} / 0.1) 55%,`,
    "transparent 78%)",
  ].join(" ");

/**
 * What actually lands *on* a subject. Softer profile than the disc: this one is
 * meant to bloom across the logo or the portrait as the spot crosses, so it has
 * no hard edge of its own - the subject's silhouette provides the edge.
 */
const highlightGradient = (h: { core: number; edge: number }) =>
  [
    "radial-gradient(closest-side circle,",
    `oklch(0.86 0.15 ${hue(h, 0.2)} / 0.62),`,
    `oklch(0.8 0.18 ${hue(h, 0.6)} / 0.38) 40%,`,
    `oklch(0.72 0.18 ${hue(h, 0.9)} / 0.15) 70%,`,
    "transparent 88%)",
  ].join(" ");

/** Halo diameter as a multiple of the disc's. */
const HALO_SCALE = 1.45;

/**
 * Diameter is clamped rather than a bare multiple of hero width: at 0.42 a
 * 390px viewport would give a 164px disc, which is *smaller* than the 234px
 * portrait standing in front of it and reads as a glow behind his head instead
 * of a light on a wall.
 */
const DISC_MIN_PX = 380;
const DISC_MAX_PX = 680;
const DISC_SCALE = 0.42;

/** Masked pools spread wider than the disc so they wash across a whole subject. */
const HIGHLIGHT_SCALE = 0.62;

const spot: SpotPose = { nx: 0, ny: 0, intensity: 0 };

type HeroLightPoolProps = {
  /**
   * Image whose alpha silhouettes the glow. Omit for the backdrop disc.
   * A masked pool lights the subject up as the spot passes over it; the
   * unmasked disc is the ambient bed behind everything.
   */
  maskUrl?: string;
  /**
   * Also clip to the portrait's bottom fade. Required for the portrait: without
   * it the pool relights the exact region that is meant to be dissolving into
   * black, which is what blew out the lower half of the previous build.
   */
  maskFade?: boolean;
  /** Peak opacity. */
  strength?: number;
  /**
   * Which fixture this pool belongs to. Picks both its colour and its path -
   * "counter" mirrors the sweep so the two cross rather than travel together.
   */
  channel?: SpotChannel;
  className?: string;
};

/**
 * The light the sweeping spotlight casts. Two jobs from one frame loop:
 *
 *   unmasked - the backdrop disc, sitting below the beam canvas so beams read
 *              as hanging in the air in front of a lit wall
 *   masked   - a highlight clipped to a subject's own alpha, which blooms as
 *              the spot crosses it and settles back afterwards
 *
 * Both read the same sampleSpot() on the same shared clock the WebGL rig uses,
 * so the cast light and the beams agree without any message passing - see
 * laser-clock.ts for why that's a wall clock and not THREE.Clock.
 */
export function HeroLightPool({
  maskUrl,
  maskFade = false,
  strength = 0.85,
  channel = "lead",
  className,
}: HeroLightPoolProps) {
  const reducedMotion = useReducedMotion();
  const tier = useLaserTier();
  const poolRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const hues = CHANNEL_HUES[channel];

  // Masking forces an offscreen composite every frame the pool moves, so only
  // the tier that promises everything gets the subject highlights. Gated on
  // "full" rather than on "not reduced" because "off" covers genuinely weak
  // hardware too (<=2 cores, <4GB) - those devices skip the WebGL rig entirely,
  // so handing them two masked pools at 60fps instead is the wrong trade.
  //
  // The disc is never gated: it is a plain CSS gradient and the hero's main
  // light source, not a WebGL embellishment.
  const skip = !!maskUrl && tier !== "full";

  useEffect(() => {
    const pool = poolRef.current;
    const host = hostRef.current;
    if (!pool || !host || skip) return;

    const section = host.closest("section");
    if (!section) return;

    // Offset of this target's centre from the hero's centre, plus the pool's
    // own size. Only re-measured on resize, so per-frame work stays two style
    // writes on an already-promoted layer.
    let offsetX = 0;
    let offsetY = 0;
    let heroHalfW = 1;
    let heroHalfH = 1;
    let reach = 1;

    const measure = () => {
      const heroRect = section.getBoundingClientRect();
      const rect = host.getBoundingClientRect();
      heroHalfW = heroRect.width / 2 || 1;
      heroHalfH = heroRect.height / 2 || 1;
      offsetX = rect.left + rect.width / 2 - (heroRect.left + heroRect.width / 2);
      offsetY = rect.top + rect.height / 2 - (heroRect.top + heroRect.height / 2);

      const diameter = maskUrl
        ? heroRect.width * HIGHLIGHT_SCALE
        : Math.min(DISC_MAX_PX, Math.max(DISC_MIN_PX, heroRect.width * DISC_SCALE));
      pool.style.width = `${Math.round(diameter)}px`;
      pool.style.height = `${Math.round(diameter)}px`;
      // How far off-centre the pool can drift before it stops lighting this
      // subject at all. Tied to the pool's own radius so it scales with layout.
      reach = diameter * 0.55;

      // Reduced motion parks the pool at a real pose from its own channel
      // rather than at the origin. Two reasons: the hero's vertical middle sits
      // in the portrait's fade region, which is the one place a light must
      // never be, and parking both fixtures at nx = 0 would stack them on the
      // same point so they read as one light. Done here so it follows the
      // measurements on resize.
      if (reducedMotion) {
        sampleSpot(SPOT_PARK_BEAT, spot, channel);
        const px = spot.nx * heroHalfW - offsetX;
        const py = -spot.ny * heroHalfH - offsetY;
        pool.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      }
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(section);

    // Reduced motion never reaches the frame loop, so it never sees the strobe
    // either. That is the intended behaviour, not an accident of control flow:
    // a flashing light is exactly what this preference is asking us not to do.
    if (reducedMotion) {
      pool.style.opacity = strength.toFixed(3);
      return () => resizeObserver.disconnect();
    }

    let frame = 0;
    const tick = () => {
      const beat = getLaserBeat();
      sampleSpot(beat, spot, channel);
      // 1 outside a burst, square 1/0 inside one. Read once and applied to
      // whichever opacity branch runs below, so the disc and the subject
      // highlights cut on exactly the same frame.
      const gate = sampleStrobe(beat);

      const px = spot.nx * heroHalfW - offsetX;
      // sampleSpot's ny points up; CSS y points down.
      const py = -spot.ny * heroHalfH - offsetY;

      pool.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;

      if (maskUrl) {
        // Proximity falloff is what makes a subject light up *as the spot
        // crosses it* and dim again afterwards. The disc deliberately skips
        // this: fading the backdrop out for drifting just cost it half its
        // brightness at the extremes of the sweep.
        const distance = Math.hypot(px / reach, py / reach);
        const falloff = Math.max(0, 1 - distance * distance);
        pool.style.opacity = (falloff * spot.intensity * strength * gate).toFixed(3);
      } else {
        pool.style.opacity = (spot.intensity * strength * gate).toFixed(3);
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [skip, maskUrl, reducedMotion, strength, channel]);

  if (skip) return null;

  // mask-size is load-bearing: the default (auto) would use the asset's
  // intrinsic size against this box and land badly oversized and offset.
  // Longhands rather than the `mask` shorthand, which resets mask-mode.
  const alphaMask = maskUrl
    ? {
        WebkitMaskImage: `url(${maskUrl})`,
        maskImage: `url(${maskUrl})`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        maskMode: "alpha" as const,
      }
    : undefined;

  const fadeMask = {
    WebkitMaskImage: PORTRAIT_FADE_MASK,
    maskImage: PORTRAIT_FADE_MASK,
  };

  // The pool, wrapped in whatever clipping this instance needs. Nested elements
  // with one mask each rather than two mask layers plus mask-composite: the
  // composite keywords differ between the -webkit- and standard properties and
  // did not reliably intersect in testing - the pool painted as an unmasked
  // rectangle over the whole portrait box.
  let inner = (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* Pre-centred by the wrapper above so this only ever takes a pure-px
          translate - no calc() to re-resolve every frame. The halo is a child
          so it inherits the pool's transform and opacity for free. */}
      <div
        ref={poolRef}
        className="relative opacity-0"
        style={{
          background: maskUrl ? highlightGradient(hues) : discGradient(hues),
          willChange: "transform, opacity",
        }}
      >
        {maskUrl ? null : (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${HALO_SCALE * 100}%`,
              height: `${HALO_SCALE * 100}%`,
              background: haloGradient(hues),
              zIndex: -1,
            }}
          />
        )}
      </div>
    </div>
  );

  if (alphaMask) {
    inner = (
      <div className="absolute inset-0 overflow-hidden" style={alphaMask}>
        {inner}
      </div>
    );
  }

  if (maskFade) {
    inner = (
      <div className="absolute inset-0 overflow-hidden" style={fadeMask}>
        {inner}
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={cn(
        "hero-glow pointer-events-none absolute inset-0 overflow-hidden",
        maskUrl ? "hero-glow-masked" : "hero-glow-disc",
        className
      )}
    >
      {inner}
    </div>
  );
}
