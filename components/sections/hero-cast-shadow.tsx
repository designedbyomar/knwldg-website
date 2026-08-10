"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { getLaserBeat } from "@/components/three/laser-clock";
import {
  SPOT_CENTER_Y,
  sampleSpot,
  type SpotPose,
} from "@/components/three/laser-choreography";
import { PORTRAIT_FADE_MASK } from "./hero-fade";

/**
 * How far the shadow throws, in px at the extremes of the sweep. The vertical
 * reach is shorter than the horizontal because the spot lives in the upper
 * band - ny never goes negative, so this only ever pushes the shadow downward.
 */
const REACH_X = 80;
const REACH_Y = 55;

const spot: SpotPose = { nx: 0, ny: 0, intensity: 0 };

type HeroCastShadowProps = {
  src: string;
  width: number;
  height: number;
  /** Clip to the portrait's bottom fade. See the note below. */
  fade?: boolean;
  blurPx?: number;
  opacity?: number;
};

/**
 * A black silhouette of a subject, thrown away from the spotlight.
 *
 * `brightness(0)` zeroes RGB while leaving alpha alone, so this traces the
 * cutout rather than painting its bounding box. The filter is static and gets
 * rasterised once; only `transform` changes per frame, which keeps the whole
 * thing on the compositor. Animating `filter: drop-shadow` instead would
 * re-rasterise the blur every frame.
 *
 * Mount it as the first child of the subject's own wrapper so it paints behind
 * the image inside that wrapper's stacking context. The portrait's shadow then
 * lands on the wordmark behind him, which is where it reads most strongly -
 * against the near-black background it would be invisible.
 */
export function HeroCastShadow({
  src,
  width,
  height,
  fade = false,
  blurPx = 22,
  opacity = 0.55,
}: HeroCastShadowProps) {
  const reducedMotion = useReducedMotion();
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shadow = shadowRef.current;
    if (!shadow) return;

    if (reducedMotion) {
      // Parked where the spot spends most of its time, so the subject still
      // reads as lit from above rather than sitting flat on the background.
      shadow.style.transform = `translate3d(0, ${(SPOT_CENTER_Y * REACH_Y).toFixed(1)}px, 0)`;
      return;
    }

    let frame = 0;
    const tick = () => {
      sampleSpot(getLaserBeat(), spot);
      // Away from the light: the spot's x pushes the shadow the other way, and
      // its height (ny, pointing up) pushes the shadow down the screen.
      const x = -spot.nx * REACH_X;
      const y = spot.ny * REACH_Y;
      shadow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  return (
    <div
      ref={shadowRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ willChange: "transform" }}
    >
      <Image
        // Same src/width/height as the real image on purpose: these resolve to
        // the same /_next/image URL and come out of cache. A plain <img> would
        // bypass the optimiser and pull the unoptimised original, which for the
        // portrait is a 1.9MB PNG fetched a second time.
        src={src}
        alt=""
        width={width}
        height={height}
        aria-hidden
        // eager, not priority: the real image next to this one already carries
        // priority and emits the preload link, so this only needs to opt out of
        // the lazy IntersectionObserver. Without it Next flags the shadow as an
        // un-eager LCP candidate, since it resolves to the same URL.
        loading="eager"
        className="h-auto w-full"
        style={{
          filter: `brightness(0) blur(${blurPx}px)`,
          opacity,
          // Without this the blur spreads below the point the subject has
          // already dissolved, painting a soft dark rectangle across the fade.
          ...(fade ? { WebkitMaskImage: PORTRAIT_FADE_MASK, maskImage: PORTRAIT_FADE_MASK } : {}),
        }}
      />
    </div>
  );
}
