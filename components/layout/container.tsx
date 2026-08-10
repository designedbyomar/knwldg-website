import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Keep this a "dumb" wrapper: no position/transform/opacity/z-index classes.
// Any of those would create a new stacking context and break z-index
// comparisons for content nested inside it (see hero.tsx's layered laser
// effect, which relies on z-10..z-50 comparing correctly across siblings).
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-page", className)}>{children}</div>;
}
