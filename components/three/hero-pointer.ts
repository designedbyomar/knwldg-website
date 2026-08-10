/**
 * Normalised pointer position over the hero, in -1..1 with +y up.
 *
 * Lives outside R3F because the canvas is pointer-events:none - useThree's
 * built-in pointer would never fire. One listener on the section feeds both the
 * DOM parallax layers and the WebGL rig, so they can never disagree about where
 * the cursor is.
 */
export const heroPointer = { x: 0, y: 0 };

const subscribers = new Set<() => void>();

export function setHeroPointer(x: number, y: number) {
  heroPointer.x = x;
  heroPointer.y = y;
  for (const notify of subscribers) notify();
}

/**
 * Register interest in pointer changes without owning the listener. Lets the
 * DOM parallax layers react on movement instead of polling on a permanent rAF.
 */
export function onHeroPointerChange(fn: () => void) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/**
 * Attaches the single pointermove listener and returns a teardown. On touch
 * there is no meaningful pointer, so callers drive the same values from scroll
 * instead (see hero-parallax.tsx).
 */
export function subscribeHeroPointer(section: HTMLElement, onChange?: () => void) {
  if (onChange) subscribers.add(onChange);

  const onPointerMove = (event: PointerEvent) => {
    const rect = section.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setHeroPointer(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, -y)));
  };

  const onPointerLeave = () => setHeroPointer(0, 0);

  section.addEventListener("pointermove", onPointerMove, { passive: true });
  section.addEventListener("pointerleave", onPointerLeave, { passive: true });

  return () => {
    if (onChange) subscribers.delete(onChange);
    section.removeEventListener("pointermove", onPointerMove);
    section.removeEventListener("pointerleave", onPointerLeave);
  };
}
