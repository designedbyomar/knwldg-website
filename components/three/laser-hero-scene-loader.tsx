"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useLaserTier } from "./use-laser-tier";
import { subscribeHeroPointer } from "./hero-pointer";
import { LASER_FADE_END_PX, LASER_FADE_START_PX, LASER_MASK_STYLE } from "./laser-mask";
import { PORTRAIT_FADE_START } from "@/components/sections/hero-fade";

const LaserHeroScene = dynamic(
  () => import("./laser-hero-scene").then((m) => m.LaserHeroScene),
  { ssr: false }
);

/**
 * The capability-gate + dynamic-import boundary for the laser effect.
 * Anyone on the "off" tier never fetches the three.js/R3F chunk at all - the
 * Hero's CSS fallback is the only thing they load.
 */
export function LaserHeroSceneLoader() {
  const tier = useLaserTier();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [cutoffRatio, setCutoffRatio] = useState(0.56);
  const [bandRatio, setBandRatio] = useState(0.21);
  const containerRef = useRef<HTMLDivElement>(null);
  const live = tier !== "off";

  useEffect(() => {
    if (!live) return;
    const win = window;
    let idleId: number | undefined;

    // Idle callback when we can get one, but always raced against a hard timer:
    // a throttled or backgrounded tab can starve requestIdleCallback well past
    // its own timeout, and the hero would just never light up.
    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(() => setReady(true), { timeout: 1500 });
    }
    const timeoutId = win.setTimeout(() => setReady(true), 1600);

    return () => {
      if (idleId !== undefined && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      win.clearTimeout(timeoutId);
    };
  }, [live]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !live) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(node);

    const onVisibilityChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [live]);

  // Measures the real portrait position (not a guessed percentage) so the laser
  // layer - and its CSS-only fallback, which renders unconditionally for
  // reduced-motion/low-power/no-WebGL users - can both mask off exactly at the
  // photo's bottom edge, at every breakpoint. Looked up independently of the
  // tier since the fallback (which needs this var too) renders even when the
  // WebGL container below never mounts.
  useEffect(() => {
    const portrait = document.getElementById("hero-portrait");
    const section = portrait?.closest("section");
    if (!portrait || !section) return;

    const measure = () => {
      const sectionRect = section.getBoundingClientRect();
      const portraitRect = portrait.getBoundingClientRect();
      const cutoff = portraitRect.bottom - sectionRect.top;
      if (cutoff > 0) {
        section.style.setProperty("--laser-cutoff", `${Math.round(cutoff)}px`);

        // Where he *starts* going translucent, which is well above the cutoff.
        // The floor scrim keys off this rather than off the cutoff: black has
        // to be arriving already by the time you can see through him, or the
        // beams behind show through his shirt.
        const fadeStart =
          portraitRect.top - sectionRect.top + PORTRAIT_FADE_START * portraitRect.height;
        section.style.setProperty("--hero-fade-start", `${Math.round(fadeStart)}px`);
        // The WebGL layer needs this too: an ancestor CSS mask doesn't reliably
        // clip a composited canvas, so the shaders fade themselves out here.
        //
        // Both are ratios rather than constants so the shader fade tracks the
        // CSS mask as the hero resizes - the px offsets are fixed, the hero
        // height is not.
        if (sectionRect.height > 0) {
          setCutoffRatio((cutoff - LASER_FADE_END_PX) / sectionRect.height);
          setBandRatio((LASER_FADE_START_PX - LASER_FADE_END_PX) / sectionRect.height);
        }
      }
    };

    measure();
    // ResizeObserver alone misses reflows that move the portrait without
    // resizing it (a wrapping headline above it, say), so watch the window too.
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(portrait);
    // The cutoff is a fraction of the section, so its height matters too.
    resizeObserver.observe(section);
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  // One pointer listener on the section, shared by the WebGL rig and the DOM
  // parallax layers. The canvas is pointer-events:none, so it can't do this.
  useEffect(() => {
    if (!live) return;
    const section = containerRef.current?.closest("section");
    if (!(section instanceof HTMLElement)) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    return subscribeHeroPointer(section);
  }, [live, ready]);

  // Lets the CSS fallback dim itself once the real rig is painting, without
  // the hero needing to know anything about WebGL.
  useEffect(() => {
    const section = containerRef.current?.closest("section");
    if (!(section instanceof HTMLElement)) return;
    section.dataset.laser = "live";
    return () => {
      delete section.dataset.laser;
    };
  }, [ready]);

  if (!live || !ready) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-10" style={LASER_MASK_STYLE} aria-hidden>
      <Suspense fallback={null}>
        <LaserHeroScene
          active={visible}
          tier={tier}
          cutoffRatio={cutoffRatio}
          bandRatio={bandRatio}
        />
      </Suspense>
    </div>
  );
}
