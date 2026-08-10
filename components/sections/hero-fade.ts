/**
 * Where the portrait dissolves, as fractions of its own height.
 *
 * Three things have to agree on these numbers or the hero breaks in a way
 * that is hard to trace:
 *   - the portrait's own mask, which does the dissolving
 *   - its cast shadow, which would otherwise blur into a dark rectangle below
 *     the point the subject has already faded out
 *   - the black floor scrim, which has to start exactly where he starts going
 *     translucent so the beams behind him are hidden by black rather than by
 *     the beam mask
 *
 * They used to be an inline Tailwind arbitrary value in one place and a magic
 * pixel offset in another, which is how the scrim ended up starting 60px late.
 */
export const PORTRAIT_FADE_START = 0.62;
export const PORTRAIT_FADE_END = 0.97;

/** The mask both the portrait and its shadow carry. */
export const PORTRAIT_FADE_MASK = `linear-gradient(to bottom, black ${
  PORTRAIT_FADE_START * 100
}%, transparent ${PORTRAIT_FADE_END * 100}%)`;

/** Distance above the portrait's bottom edge at which the scrim is fully opaque. */
export const SCRIM_SETTLE_PX = 45;
