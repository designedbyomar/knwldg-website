import { cn } from "@/lib/utils";
import { LASER_MASK_STYLE } from "./laser-mask";

/**
 * Static, SSR-able beam layer. This is the hero's default paint (avoids any
 * flash-of-empty-hero before the WebGL scene decides whether to mount) and the
 * permanent visual for reduced-motion / low-power / no-WebGL2 devices.
 *
 * Sits below the canvas and dims itself once the real rig is live - see the
 * [data-laser="live"] rule in globals.css.
 */
export function LaserFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("laser-fallback pointer-events-none absolute inset-0", className)}
      style={{
        // Narrow angled gradients fanning from a shared origin, so the static
        // paint echoes the straight beams the WebGL rig draws rather than the
        // soft blobs the old fog-style effect used.
        // Each band is a thin bright core inside a tight coloured halo - the
        // same profile the WebGL shader draws analytically - so the static
        // paint reads as beams rather than as fog.
        backgroundImage: [
          ["var(--color-ultraviolet)", 38],
          ["var(--color-violet)", 64],
          ["var(--color-orchid)", 90],
          ["var(--color-magenta)", 116],
          ["var(--color-rose)", 142],
        ]
          .map(
            ([color, angle]) =>
              `linear-gradient(${angle}deg, transparent 48.8%, color-mix(in srgb, ${color} 30%, transparent) 49.6%, color-mix(in srgb, ${color} 92%, white) 50%, color-mix(in srgb, ${color} 30%, transparent) 50.4%, transparent 51.2%)`
          )
          .concat(
            "radial-gradient(40% 30% at 50% 68%, color-mix(in srgb, var(--color-orchid) 22%, transparent), transparent 72%)"
          )
          .join(", "),
        ...LASER_MASK_STYLE,
      }}
    />
  );
}
