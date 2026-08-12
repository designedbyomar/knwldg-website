/**
 * Icon tokens. Normative values live in DESIGN.md > Components > Iconography;
 * this is the JS mirror, the same split theme-tokens.ts uses for colour.
 *
 * One library only (Lucide). Mixing icon sets puts two optical grids and two
 * stroke weights on the same page, which is the incoherence PRODUCT.md lists
 * under anti-references.
 */

/** Lucide's own default is 24. 20 sits closer to the 12px UI label rhythm. */
export const ICON_SIZE = 20;

/**
 * Lucide's own default is 2. 1.75 reads finer against the site's hairline
 * rules (fg/10 - fg/12) without looking timid beside Anton display type.
 */
export const ICON_STROKE = 1.75;
