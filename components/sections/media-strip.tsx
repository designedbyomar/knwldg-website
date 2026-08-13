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
 * Playback rules, all deliberate:
 * - `preload="none"` plus a poster: nothing downloads until someone actually
 *   wants it. Five autoloading clips would cost megabytes on first paint.
 * - Fine pointer plays on hover *and focus*. Hover-only playback is invisible
 *   to a keyboard, which is why the tiles are real buttons.
 * - Coarse pointer plays the most-visible clip while scrolling, one at a time.
 *   Three simultaneous decodes is exactly the workload phones are worst at.
 * - Reduced motion never autoplays anything; the poster stands in. Consistent
 *   with every other animated layer here, which parks at a real pose.
 */

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  return coarse;
}

export function MediaStrip() {
  const reducedMotion = useReducedMotion();
  const coarse = useCoarsePointer();
  const [active, setActive] = useState<number | null>(null);
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

  useEffect(() => {
    if (reducedMotion) {
      setPlaying(null);
      return;
    }
    if (!coarse) return;

    // Touch: whichever tile is most visible plays, and only that one.
    const nodes = containerRef.current?.querySelectorAll("[data-tile]");
    if (!nodes?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.tile);
          const ratio = entry.intersectionRatio;
          if (entry.isIntersecting && ratio > 0.6 && (!best || ratio > best.ratio)) {
            best = { index, ratio };
          }
        }
        if (best) {
          setActive(best.index);
          setPlaying(best.index);
        }
      },
      { threshold: [0, 0.6, 0.9] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [coarse, reducedMotion, setPlaying]);

  const activate = (index: number) => {
    if (reducedMotion || coarse) return;
    setActive(index);
    setPlaying(index);
  };

  const deactivate = () => {
    if (reducedMotion || coarse) return;
    setActive(null);
    setPlaying(null);
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
            onMouseEnter={() => activate(i)}
            onMouseLeave={deactivate}
            onFocus={() => activate(i)}
            onBlur={deactivate}
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
              isActive && "content:scale-[1.04] content:shadow-[0_0_40px_-4px_rgb(0_0_0/0.95)]"
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
                  isActive ? "[filter:grayscale(0)_contrast(1)]" : "[filter:grayscale(1)_contrast(1.08)]"
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
                  isActive ? "[filter:grayscale(0)_contrast(1)]" : "[filter:grayscale(1)_contrast(1.08)]"
                )}
              />
            )}

            {/* Brand duotone at rest. `color` takes hue and saturation from this
                layer and luminance from the frame beneath, so the greyscale
                image is recoloured along the ramp rather than washed over -
                which is why the media is fully desaturated first. Fades out
                entirely on hover/focus/play so the real colour comes back. */}
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
