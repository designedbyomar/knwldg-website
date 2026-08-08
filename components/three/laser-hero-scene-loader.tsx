"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useDeviceCapability } from "./use-device-capability";

const LaserHeroScene = dynamic(
  () => import("./laser-hero-scene").then((m) => m.LaserHeroScene),
  { ssr: false }
);

/**
 * The capability-gate + dynamic-import boundary for the laser effect.
 * Anyone who doesn't get the WebGL scene never fetches the three.js/R3F
 * chunk at all - the Hero's CSS fallback is the only thing they load.
 */
export function LaserHeroSceneLoader() {
  const capable = useDeviceCapability();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!capable) return;
    const win = window;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(() => setReady(true), { timeout: 1500 });
    } else {
      timeoutId = win.setTimeout(() => setReady(true), 200);
    }

    return () => {
      if (idleId !== undefined && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) win.clearTimeout(timeoutId);
    };
  }, [capable]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !capable) return;

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
  }, [capable]);

  if (!capable || !ready) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-10" aria-hidden>
      <Suspense fallback={null}>
        <LaserHeroScene active={visible} />
      </Suspense>
    </div>
  );
}
