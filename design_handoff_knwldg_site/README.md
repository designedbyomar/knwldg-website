# Handoff: KNWLDG — DJ booking site

## Overview
Marketing site for KNWLDG, an open-format DJ serving Connecticut, the NYC metro, western Massachusetts, and the wider Northeast. The site has two jobs: get a visitor to submit a booking inquiry, and let them get to know the DJ well enough to trust him with their event.

## About the design files
`knwldg-site-8a.html` and `knwldg-site-9a.html` are **design references created in HTML** — prototypes showing the intended look, structure, and copy. They are not production code. Recreate them in the target codebase's existing environment (React, Next, Astro, etc.) using its established component and styling patterns. If no environment exists yet, pick an appropriate framework and implement there.

Both files render at a fixed 960px design width (they were authored inside a design canvas). Responsive behavior is **not** specified in the prototypes — see "Responsive" below.

- **8a is the direction being built.** Centered hero: the wordmark sits behind the DJ photo, tagline and CTA below, then stats, events, gallery, genres, booking, footer. No genre marquee.
- **9a** is an alternate asymmetric-hero exploration, kept for reference. Sections below the hero are near-identical between the two.

Where the two differ, follow 8a.

## Fidelity
**High fidelity.** Colors, type, spacing, and copy are final. Recreate the UI closely; substitute the codebase's own primitives (buttons, form fields, grid) where they exist.

## Screens / views

Single scrolling page. Section order in 9a:

### 1. Nav (sticky candidate)
Height ~64px, `padding: 18px 40px`, bottom border `oklch(0.97 0.006 300 / 0.1)`.
Left: gradient wordmark, 72px wide, aspect 1527/763. Right: `THE DJ`, `EVENTS`, `SETS` (Work Sans 11px, letter-spacing 0.14em, uppercase, 28px gap) then a filled gradient button `CHECK A DATE` (9px 18px, no radius, dark text).

### 2. Hero — asymmetric split
Grid `1fr 340px`, no gap.
- **Left** (`padding: 56px 0 40px 40px`): eyebrow `CT · NYC METRO · W. MASS · NORTHEAST` (Work Sans 11px, 0.16em, magenta `oklch(0.78 0.19 320)`); headline Anton 82px / line-height 0.88, uppercase — "Sound. / Energy. / Atmosphere." with the third line filled by the brand gradient via `background-clip: text`; body Sora 15px / 1.6 at 62% white, max-width 400px; two buttons — primary gradient `CHECK YOUR DATE`, secondary outlined `HEAR A SET` (both 16px vertical padding, square corners).
- **Right**: gradient panel `linear-gradient(160deg, oklch(0.16 0.09 320), oklch(0.1 0.06 280))` with a radial magenta wash at the top; the DJ photo sits at 112% width, offset -6% left, and fades into the page background with a bottom gradient (40% height).

### 3. Genre marquee
Full-bleed strip, background `oklch(0.08 0.008 300)`, 1px borders top and bottom. Anton 15px uppercase, 0.12em tracking, 55% white, 40px gap, list duplicated once and translated `0 → -50%` over 24s linear infinite. Two items are accented (R&B magenta, AFROBEATS violet). Genres: Hip-Hop, R&B, Latin, House, Afrobeats, Dancehall, EDM, Pop, Throwbacks, Rock.
*(8a intentionally omits this strip.)*

### 4. Stats strip
4-column grid, 1px right dividers, `padding: 26px 24px` per cell. Anton 34px numbers, Work Sans 11px / 0.08em labels at 50% white. Values: `15+` YEARS BEHIND THE DECKS · `600+` EVENTS PLAYED · `4` STATES SERVED · `24h` TYPICAL REPLY TIME (last number uses the gradient text fill).

### 5. Meet KNWLDG
Grid `300px 1fr`, gap 48, `padding: 72px 40px`.
- Left: eyebrow `01 — THE DJ`, Anton 38px "Meet / KNWLDG", then a 3:4 portrait slot (placeholder in the prototype — **needs a real photo**).
- Right: pull quote Sora 19px / 1.55 at 90% white; supporting paragraph Sora 15px / 1.65 at 60%; then a 2×2 capability grid built as a 1px-gap grid over a hairline background: Open-format mixing, Sound + lighting, MC + microphone, Planning + coordination.

### 6. Events
`padding: 72px 40px`. Header row: Anton 38px "Built for your event / and your crowd." left, `FIVE ROOMS, ONE APPROACH` right (Work Sans 12px, 50% white), baseline-aligned.
5-column grid, 1px gap over a hairline background. Each card: Anton 12px index `01`–`05` in a magenta→violet hue ramp (320, 310, 300, 290, 280), Sora 600 14px title, Sora 12px / 1.45 description at 55%.
Cards: Weddings · Corporate · Festivals · Private · Nightlife.

### 7. Sets + testimonials
Two equal columns.
- Left: full brand gradient panel, dark text (`oklch(0.14 0.01 300)`), eyebrow `03 — SETS`, Anton 34px "Hear it before / you book it.", then three set rows with title + duration (`▶` marker, 1px separators at 25% dark).
- Right: two testimonials, Sora 17px / 1.55 quote + Work Sans 11px attribution, separated by a hairline.

### 8. Booking
Grid `300px 1fr`, `padding: 72px 40px`. Left: eyebrow `04 — BOOKING`, Anton 38px "Start with / the date.", reassurance line about a 1-day reply.
Right: 2-column field grid — Event Date, Event Type, Venue / City, Guest Count, Name, Email, Phone, Services Needed (underlined fields, uppercase 11px labels). Then a Budget chip row (Under $1,000 / $1,000–$2,000 / $2,000–$3,000 / $3,000–$4,000 / $4,000+ / Not Sure Yet), an Event Details field, and the gradient submit `REQUEST AVAILABILITY`.
**Date first is deliberate** — availability is the question every visitor has.

### 9. Footer
Background `oklch(0.05 0.005 300)`, `padding: 36px 40px`. Left: 96px gradient wordmark + locations line "Connecticut · NYC Metro · Western Massachusetts · Northeast". Right: INSTAGRAM · EMAIL · djknwldg.com.

## Interactions & behavior
Prototype is static; implement the following:
- Nav `CHECK A DATE`, hero `CHECK YOUR DATE`, and the events CTA all scroll to the booking section.
- `HEAR A SET` scrolls to section 7; set rows become audio players (SoundCloud/Mixcloud embeds or a custom player) — one playing at a time.
- Marquee: pure CSS translate loop, pause on hover; respect `prefers-reduced-motion` (stop the animation).
- Booking form: real inputs replacing the underlined label divs; required = date, event type, name, email. Budget chips are single-select toggles (gradient fill when active). Submit posts to email/CRM and swaps the form for a confirmation that restates the 24-hour reply promise.
- Hover: buttons lighten ~6%; event cards raise their background to `oklch(0.09 0.008 300)`; nav items go to full white.

## State
- `form` object for the booking fields, `selectedBudget`, `submitting`, `submitted`, `errors`.
- `activeSet` for the audio player.
- No data fetching beyond the form POST.

## Design tokens
Colors (OKLCH, as authored):
- Page background `oklch(0.06 0.006 300)`; alt panel `oklch(0.08 0.008 300)`; footer `oklch(0.05 0.005 300)`
- Ink on gradient / light surfaces `oklch(0.14 0.01 300)`
- Text `oklch(0.97 0.006 300)`; secondary at 0.6–0.65 alpha; tertiary/labels at 0.5; hairlines at 0.1–0.15
- Brand magenta `oklch(0.78 0.19 320)` · brand violet `oklch(0.78 0.19 280)`
- Brand gradient `linear-gradient(150deg, oklch(0.78 0.19 320), oklch(0.78 0.19 280))` (120deg for text fills, 90deg for the logo mask)

Type: **Anton** (display, uppercase — 82 / 38 / 34 / 12), **Sora** (body — 19 / 17 / 15 / 14 / 12.5 / 12), **Work Sans** (UI, uppercase, tracked 0.06–0.16em — 13 / 12 / 11).

Spacing: section padding 72px vertical / 40px horizontal; grid gaps 48 (layout), 24/18 (form), 1px (hairline grids). Radius: **0 everywhere** — squared corners are part of the identity.

## Responsive
Not designed yet. Recommended: at <900px collapse the hero to a single column (photo above the headline), stats to 2×2, events to a horizontal scroll or 2-column grid, sets/testimonials and booking to single column. Keep the marquee full-bleed.

## Assets
- `assets/knwldg-mark-gradient.svg` — KNWLDG wordmark, filled with the brand gradient via an internal `<linearGradient>` (#f45ff0 → #9b6bff). Used as a plain `<img>` at 72px (nav) and 96px (footer). `assets/knwldg-mark.svg` is the flat-fill version if you need a single-color or masked treatment. When inlining, add `role="img"` and a title of "KNWLDG".
- `assets/knwldg-photo.png` — hero photo of the DJ, transparent background.
- Still needed: portrait for "Meet KNWLDG", performance/crowd/venue photos, real set recordings, real testimonial attributions.

## Files
- `knwldg-site-8a.html` — **the direction to build**, full page.
- `knwldg-site-9a.html` — alternate exploration (asymmetric split hero).

## 8a hero (overrides section 2 above)
Centered, dark (`oklch(0.06 0.006 300)`), `padding: 0 32px 40px`. The gradient wordmark sits absolutely at 820px wide, ~8% from the top, centered and at 90% opacity; the DJ photo (360px, centered, drop shadow `0 24px 44px oklch(0.05 0.02 300 / 0.7)`) overlaps it in front, with a bottom fade into the page background. Below, tightly stacked: Anton 26px "Sound. Energy. Atmosphere.", Sora 15px locations line (max-width 480px), gradient `CHECK AVAILABILITY` button, then `15+ YEARS • OPEN FORMAT • SOUND + LIGHTING` in Work Sans 12px at 45%. The whole block is tuned to sit above the fold.

## Pills
Chip groups (capabilities, budget) use a light indigo accent — the palette's third color: background `oklch(0.8 0.09 275 / 0.12)`, border `oklch(0.8 0.09 275 / 0.45)`, text `oklch(0.88 0.07 275)`, 8px/14–16px padding, square corners. The genre pills on the gradient section keep the dark outline treatment.
