"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { heroPointer, onHeroPointerChange } from "@/components/three/hero-pointer";

const PARALLAX_SPRING = { stiffness: 60, damping: 22, mass: 0.6 };

export const MARK_PARALLAX_PX = 12; // farther layer, moves less
export const PORTRAIT_PARALLAX_PX = -22; // nearer layer, moves more and opposite

type HeroParallaxProps = {
  depth: number;
  className?: string;
  children: ReactNode;
};

/**
 * Depth for the logo mark and the portrait. Takes its children as a prop so the
 * <Image>s stay server-rendered and out of the client bundle.
 *
 * Translate only, never rotate or scale: these layers sit directly behind the
 * headline, and rotating them makes their edges shimmer against the text.
 */
export function HeroParallax({ depth, className, children }: HeroParallaxProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // On touch there is no pointer to follow, so the same downstream transform
  // chain is driven by scroll progress over the hero instead.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    if (reducedMotion) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (coarse) {
      return scrollYProgress.on("change", (v) => {
        pointerX.set(0);
        pointerY.set(-v);
      });
    }

    // Event-driven rather than a permanent rAF: the spring below keeps
    // animating between pointer events on its own.
    return onHeroPointerChange(() => {
      pointerX.set(heroPointer.x);
      pointerY.set(heroPointer.y);
    });
  }, [reducedMotion, scrollYProgress, pointerX, pointerY]);

  const x = useSpring(useTransform(pointerX, (v) => v * depth), PARALLAX_SPRING);
  const y = useSpring(useTransform(pointerY, (v) => v * depth * 0.55), PARALLAX_SPRING);

  if (reducedMotion) {
    return (
      <div ref={containerRef} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={containerRef} className={className} style={{ x, y }}>
      {children}
    </motion.div>
  );
}
