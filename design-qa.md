# Design QA — Inset Open-Format Panel

## Visual truth

- Source: user-provided reference image in the current conversation (`1424 × 678` PNG). The reference is used for framing only: an equal inset from the page edges and softened corners around one bounded surface.
- Implementation: `output/playwright/genre-panel-inset-desktop-section.png` (`1424 × 417`, CSS-pixel capture at DPR 1).
- Detail capture: `output/playwright/genre-panel-inset-desktop.png` (`1328 × 321`, CSS-pixel capture at DPR 1).
- Responsive capture: `output/playwright/genre-panel-inset-mobile.png` (`390 × 535`, CSS-pixel capture at DPR 1).
- Design-system capture: `output/playwright/design-system-inset-panel.png` (`984 × 279`, CSS-pixel capture at DPR 1).

## Comparison

The source and implementation were reviewed together at the reference width. The reference establishes approximately 50px desktop gutters and low-20px corner radii. The implementation uses 48px desktop gutters and a 24px radius, which preserves the same contained-box silhouette while retaining the site's black ground and five-color gradient. The implementation intentionally keeps the existing section content and height because the reference photograph is a framing reference, not a content or aspect-ratio target.

## Findings and checks

- Desktop panel bounds: `x: 48`, `width: 1328` inside a `1424px` viewport.
- The gradient no longer reaches any page edge; black space is visible on all four sides.
- Corner rounding is consistent across the live section and design-system specimen.
- Mobile gutters reduce to 16px, the heading and chips wrap cleanly, and there is no horizontal overflow.
- Main page browser console: 0 errors.
- Design-system browser console: 0 errors.
- `npm run lint`: passed.
- `npx next build --webpack`: passed.

## QA history

1. Initial desktop capture occurred while the existing reveal transition was still settling, so the content appeared partially faded.
2. Rechecked after the transition completed; spacing, corners, gradient, typography, and chip layout rendered correctly.
3. Rechecked at `390 × 844`; responsive inset and content wrapping passed without code changes.
4. Rechecked the design-system specimen; it matches the live inset-panel geometry and usage guidance.

## Final result

passed
