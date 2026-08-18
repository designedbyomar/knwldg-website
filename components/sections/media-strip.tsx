"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { GALLERY } from "@/data/capabilities";
import { cn } from "@/lib/utils";

/**
 * Overlapping media strip.
 *
 * Tiles overlap rather than sitting in the usual 1px-seam grid — the one place
 * in the system where surfaces are allowed to stack. See DESIGN.md > Media for
 * why that exception exists and what it is bounded to.
 *
 * Two separate questions, deliberately not the same value:
 *
 * *Which tile shows full colour* — whichever is centred, image or video. On a
 * coarse pointer there is no hover, so this is the only thing that lifts the
 * duotone; tying it to playback left photographs tinted forever.
 *
 * *Which video plays* — a strict subset: videos only, one at a time, never under
 * reduced motion.
 *
 * The rest, all deliberate:
 * - `preload="none"` plus a poster: nothing downloads until someone actually
 *   wants it. Five autoloading clips would cost megabytes on first paint.
 * - Fine pointer plays on hover *and focus*. Hover-only playback is invisible
 *   to a keyboard, which is why the tiles are real buttons.
 * - Coarse pointer plays the most-visible clip while scrolling, one at a time.
 *   Three simultaneous decodes is exactly the workload phones are worst at.
 * - Reduced motion suppresses the motion — autoplay and the scale — but still
 *   reveals colour. A cross-fade is not a vestibular trigger, and killing it
 *   left the whole strip inert for anyone with the preference on.
 */

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const q = window.matchMedia(query);
    const sync = () => setMatches(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, [query]);
  return matches;
}

/**
 * Mirrors `--breakpoint-content` in app/globals.css. Below it the strip is a
 * snap scroller and "most visible" means something; at or above it every tile
 * is on screen at once, so the observer has nothing to choose between.
 */
const CONTENT_BREAKPOINT = "(min-width: 56.25rem)";

/**
 * Which tile is centred enough to own the colour reveal - any kind. Images were
 * filtered out here once, which meant a centred photograph could never leave the
 * duotone on touch, where there is no hover to fall back on.
 */
export function selectMostVisibleTile(
  ratios: Readonly<Record<number, number>>,
  centreDistance: Readonly<Record<number, number>> = {}
): number | null {
  let best: { index: number; ratio: number; distance: number } | null = null;

  for (let index = 0; index < GALLERY.length; index += 1) {
    const ratio = ratios[index] ?? 0;
    if (ratio <= 0.6) continue;

    const distance = centreDistance[index] ?? 0;
    if (!best) {
      best = { index, ratio, distance };
      continue;
    }

    // Ratio decides, then distance from the viewport centre. The tie-break is
    // load-bearing: when several tiles are equally visible a strict `>` never
    // displaces the incumbent, which pinned index 0 active permanently.
    const wins =
      ratio > best.ratio || (ratio === best.ratio && distance < best.distance);
    if (wins) best = { index, ratio, distance };
  }

  return best?.index ?? null;
}

/**
 * Playback is a narrower question than colour: only videos play, only one at a
 * time, and never under reduced motion. Returning null is also what pauses the
 * previous clip when an image scrolls into the centre.
 */
export function videoToPlay(
  active: number | null,
  reducedMotion: boolean
): number | null {
  if (active === null || reducedMotion) return null;
  return GALLERY[active]?.kind === "video" ? active : null;
}

/**
 * Which tile is active once both inputs are considered.
 *
 * A pointed tile always wins. The fallback is the part that matters: releasing
 * a hover changes no intersection ratio, so the observer has nothing to report
 * and stays silent. Returning null there stranded the centred tile in the
 * duotone with its video paused until the next threshold crossing - which in a
 * snap scroller can mean until the reader scrolls to another tile entirely.
 */
export function resolveActive(
  pointed: number | null,
  scrolls: boolean,
  ratios: Readonly<Record<number, number>>,
  centreDistance: Readonly<Record<number, number>>
): number | null {
  if (pointed !== null) return pointed;
  return scrolls ? selectMostVisibleTile(ratios, centreDistance) : null;
}

export function MediaStrip() {
  const reducedMotion = useReducedMotion();
  // Only one media query left, and it asks about layout, not input. Whether a
  // pointer can hover is decided per event from `pointerType` instead - see the
  // handlers below for why no media query can answer that correctly.
  const scrolls = !useMediaQuery(CONTENT_BREAKPOINT);
  const [active, setActive] = useState<number | null>(null);
  const hoverIndex = useRef<number | null>(null);
  const focusIndex = useRef<number | null>(null);
  const lastIntersectionRatio = useRef<Record<number, number>>({});
  const lastCentreDistance = useRef<Record<number, number>>({});
  // A Map keyed by gallery index, not an array. Only entries 0/2/4 are videos,
  // and a sparse array indexed that way mis-assigned the first tile: focusing
  // tile 0 played tile 2's clip. A Map has no holes to reason about.
  const videos = useRef(new Map<number, HTMLVideoElement>());
  const containerRef = useRef<HTMLDivElement>(null);

  // play() rejects if the element is paused before the promise settles - a fast
  // hover in/out does exactly that. Swallowing keeps the console clean without
  // hiding anything actionable.
  const setPlaying = useCallback((index: number | null) => {
    for (const [i, video] of videos.current) {
      if (i === index) {
        void video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    }
  }, []);

  const syncActive = useCallback(() => {
    const nextIndex = resolveActive(
      hoverIndex.current ?? focusIndex.current,
      scrolls,
      lastIntersectionRatio.current,
      lastCentreDistance.current
    );
    setActive(nextIndex);
    setPlaying(videoToPlay(nextIndex, Boolean(reducedMotion)));
  }, [reducedMotion, scrolls, setPlaying]);

  useEffect(() => {
    // Only while the strip is actually a scroller. Above the content breakpoint
    // every tile is fully visible, so "most visible" is a tie the observer has
    // no business resolving - and resolving it anyway pinned one tile active.
    if (!scrolls) return;

    const nodes = containerRef.current?.querySelectorAll("[data-tile]");
    if (!nodes?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.tile);
          const visible = entry.isIntersecting ? entry.intersectionRatio : 0;
          lastIntersectionRatio.current[index] = visible;

          const rect = entry.boundingClientRect;
          const root = entry.rootBounds;
          const rootCentre = root ? root.left + root.width / 2 : window.innerWidth / 2;
          lastCentreDistance.current[index] = Math.abs(
            rect.left + rect.width / 2 - rootCentre
          );
        }

        // A deliberate hover or focus outranks scroll position. Both paths can
        // be live at once on a hover-capable device in a narrow window.
        if (hoverIndex.current !== null || focusIndex.current !== null) return;

        const best = selectMostVisibleTile(
          lastIntersectionRatio.current,
          lastCentreDistance.current
        );
        setActive(best);
        setPlaying(videoToPlay(best, Boolean(reducedMotion)));
      },
      { threshold: [0, 0.6, 0.9] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      lastIntersectionRatio.current = {};
      lastCentreDistance.current = {};
      // Crossing up past the breakpoint leaves `active` holding whatever the
      // observer last chose. Without this the tile stays lit on desktop.
      if (hoverIndex.current === null && focusIndex.current === null) {
        setActive(null);
        setPlaying(null);
      }
    };
  }, [scrolls, reducedMotion, setPlaying]);

  const activate = (index: number, source: "hover" | "focus") => {
    if (source === "hover") {
      hoverIndex.current = index;
    } else {
      focusIndex.current = index;
    }
    syncActive();
  };

  const deactivate = (index: number, source: "hover" | "focus") => {
    if (source === "hover" && hoverIndex.current === index) {
      hoverIndex.current = null;
    }
    if (source === "focus" && focusIndex.current === index) {
      focusIndex.current = null;
    }
    syncActive();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex snap-x snap-mandatory overflow-x-auto pb-2",
        // Overlap is the point. -ml pulls each tile onto the one before it;
        // the first keeps its natural edge so the strip starts flush left.
        "content:overflow-visible content:pb-0"
      )}
    >
      {GALLERY.map((item, i) => {
        const isActive = active === i;
        return (
          <button
            key={item.label}
            type="button"
            data-tile={i}
            aria-label={item.alt}
            // `pointerType` is read from the event that actually happened, so
            // it cannot be wrong about the device the way a media query can.
            // Touch synthesises enter/leave on tap, which is the only thing the
            // old gate was really there to suppress - exclude just that, and a
            // mouse works everywhere, including on hardware that reports its
            // primary pointer as coarse.
            onPointerEnter={(e) => {
              if (e.pointerType === "touch") return;
              activate(i, "hover");
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "touch") return;
              deactivate(i, "hover");
            }}
            // Focus is never gated. Keyboard reveal has to work on every device.
            onFocus={() => activate(i, "focus")}
            onBlur={() => deactivate(i, "focus")}
            style={{ zIndex: isActive ? GALLERY.length + 1 : i + 1 }}
            className={cn(
              "group relative aspect-3/4 w-[62%] shrink-0 snap-center overflow-hidden",
              "outline-none ring-violet transition-[transform,box-shadow] duration-500 ease-out",
              "focus-visible:ring-2",
              "content:w-[calc((100%+7rem)/5)]",
              i > 0 && "-ml-6 content:-ml-7",
              // Each tile casts onto the one it covers. Without this the overlap
              // is geometrically correct but invisible - five dark tiles read as
              // one flat band. This is the shadow DESIGN.md's "flat until
              // floating" rule carves out for genuinely stacked surfaces.
              i > 0 && "shadow-[-14px_0_24px_-8px_rgb(0_0_0/0.9)]",
              isActive && "content:shadow-[0_0_40px_-4px_rgb(0_0_0/0.95)]",
              // The lift is the only real motion here, so it is the only part
              // reduced motion drops. Colour and shadow still resolve.
              isActive && !reducedMotion && "content:scale-[1.04]"
            )}
          >
            {item.kind === "image" ? (
              <Image
                src={item.src}
                alt=""
                fill
                sizes="(min-width: 900px) 20vw, 62vw"
                className={cn(
                  "object-cover transition-[filter] duration-500 ease-out",
                  isActive
                    ? "[filter:grayscale(0)_contrast(1)]"
                    : "[filter:grayscale(1)_contrast(0.92)_brightness(0.88)]"
                )}
              />
            ) : (
              <video
                ref={(el) => {
                  if (el) videos.current.set(i, el);
                  else videos.current.delete(i);
                }}
                src={item.src}
                poster={item.poster}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-[filter] duration-500 ease-out",
                  isActive
                    ? "[filter:grayscale(0)_contrast(1)]"
                    : "[filter:grayscale(1)_contrast(0.92)_brightness(0.88)]"
                )}
              />
            )}

            {/* Brand duotone at rest. `color` takes hue and saturation from this
                layer and luminance from the frame beneath, so the greyscale
                image is recoloured along the ramp rather than washed over -
                which is why the media is fully desaturated first. Fades out
                entirely on hover/focus/play so the real colour comes back.

                The rest filter's `contrast(0.92) brightness(0.88)` is load-
                bearing, not taste. Every ramp stop is oklch(0.78 0.19 H), so a
                brand hue only exists around L 0.78; sRGB has no bright *and*
                saturated colour. Left at full range, highlights - a white shirt
                under stage light - clip to flat magenta with hard banding.
                Compressing the backdrop toward the ramp's own lightness keeps
                them where the blend can actually land. Raising contrast here
                brings the posterisation straight back. */}
            <span
              aria-hidden
              className={cn(
                "brand-gradient-diagonal pointer-events-none absolute inset-0 mix-blend-color transition-opacity duration-500",
                isActive ? "opacity-0" : "opacity-85"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
