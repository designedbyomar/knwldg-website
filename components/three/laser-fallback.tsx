import { cn } from "@/lib/utils";

/**
 * Static, SSR-able haze layer. This is the hero's default paint (avoids any
 * flash-of-empty-hero before the WebGL scene decides whether to mount) and
 * the permanent visual for reduced-motion / low-power / no-WebGL2 devices.
 */
export function LaserFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-70 mix-blend-screen", className)}
      style={{
        backgroundImage: [
          "radial-gradient(38% 45% at 30% 15%, oklch(0.78 0.19 320 / 0.35), transparent 70%)",
          "radial-gradient(42% 50% at 70% 10%, oklch(0.78 0.19 280 / 0.3), transparent 70%)",
          "radial-gradient(30% 35% at 50% 30%, oklch(0.8 0.09 275 / 0.2), transparent 70%)",
        ].join(", "),
      }}
    />
  );
}
