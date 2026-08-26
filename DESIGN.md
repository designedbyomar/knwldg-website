---
name: KNWLDG
description: A sharp, performance-led identity built from black, white, five spectral accents, and disciplined square geometry.
colors:
  black: "oklch(0 0 0)"
  white: "oklch(1 0 0)"
  ultraviolet: "oklch(0.78 0.19 260)"
  violet: "oklch(0.78 0.19 280)"
  orchid: "oklch(0.78 0.19 300)"
  magenta: "oklch(0.78 0.19 320)"
  rose: "oklch(0.78 0.19 340)"
typography:
  display:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(32px, 3vw, 38px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "normal"
  headline:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(22px, 6vw, 26px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Anton, sans-serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  body:
    fontFamily: "Sora, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Sora, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
icon:
  library: "Lucide"
  size: "20px"
  strokeWidth: 1.75
rounded:
  square: "0px"
  pill: "9999px"
spacing:
  tight: "8px"
  control: "12px"
  content: "20px"
  gutter-mobile: "20px"
  gutter-desktop: "56px"
  section-mobile: "80px"
  section-desktop: "112px"
components:
  button-primary:
    backgroundColor: "linear-gradient(105deg, oklch(0.78 0.19 260) 0%, oklch(0.78 0.19 280) 100%)"
    textColor: "{colors.black}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "16px 32px"
  button-outline:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "12px 24px"
  link-hub-row:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    borderColor: "oklch(1 0 0 / 0.3)"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    minHeight: "56px"
  chip-resting:
    backgroundColor: "oklch(0.78 0.19 280 / 0.12)"
    textColor: "{colors.violet}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  chip-selected:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.black}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0 0 10px"
  location-autocomplete:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    activeBackgroundColor: "{colors.violet}"
    activeTextColor: "{colors.black}"
    attribution: "© OpenStreetMap contributors · Powered by Geoapify"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
---

# Design System: KNWLDG

## Overview

**Creative North Star: "The Laser-Cut Dance Floor"**

KNWLDG is a black performance space cut by controlled light. The visual system is electric, disciplined, and crowd-aware: strong type establishes the beat, square geometry creates structure, and the five-color ramp supplies movement without becoming generic nightlife decoration.

The system balances club energy with the clarity required by wedding, corporate, festival, and private-event clients. It rejects soft wedding-template styling, undirected neon, and corporate card stacks. Every section should communicate one idea with a strict grid, deliberate spacing, and enough black space for the accents to feel like light.

**Key Characteristics:**

- Black stage, white information, five spectral accents.
- Square-edged surfaces and disciplined grid seams.
- Anton display type paired with Sora body and UI type.
- Full-palette energy used in named, repeatable roles.
- Flat content hierarchy with one functional floating shadow.
- Choreographed hero motion and restrained motion everywhere else.

## Colors

The palette behaves like a light rig: black is the room, white is the readable signal, and five equal-lightness accents move from cool Ultraviolet to warm Rose.

### Primary

- **Ultraviolet:** Opens the complete ramp, begins primary button gradients, and carries the cool edge of the favicon.
- **Violet:** Defines resting and selected chips, calendar selection, and the cool side of the identity gradient.
- **Orchid:** Bridges cool and warm accents in the full ramp and marks today's date. It is no longer part of the primary action gradient.

### Secondary

- **Magenta:** Marks form focus, validation errors, and the warm side of the identity gradient.
- **Rose:** Closes the complete ramp and supplies controlled solid emphasis for statistics.

### Neutral

- **Black:** The only background, surface, footer, and dark-text neutral. Depth comes from opacity, never from introducing gray tokens.
- **White:** The only light neutral. Use it for primary reading text, hairlines, and hierarchy through opacity.

### Named Rules

**The Full Ramp Has a Job Rule.** The five-stop sequence is Ultraviolet, Violet, Orchid, Magenta, Rose. Use it for the square open-format field, the favicon, and explicitly documented full-ramp treatments only.

**The Role-Based Gradient Rule.** Primary buttons use Ultraviolet, Violet. Brand marks use Violet, Magenta. The unassigned variation is Magenta, Rose. Never improvise a new sequence when an approved role already exists.

**The Ink on Light Rule.** Text on solid accents and gradients is always Black. White text on a bright ramp is forbidden.

**The Two-Neutral Rule.** Black and White are the complete neutral palette. Create hierarchy with opacity, not extra gray or tinted-neutral tokens.

**The Muted Text Floor.** `text-fg/50` is the lowest opacity permitted for normal text on black. Measured against the black ground:

| Step | Renders | Contrast | |
|---|---|---|---|
| `text-fg/30` | `#4c4c4c` | 2.46:1 | disabled or decorative only |
| `text-fg/40` | `#666666` | 3.66:1 | **fails 1.4.3** |
| `text-fg/45` | `#737373` | 4.41:1 | **fails 1.4.3** |
| **`text-fg/50`** | `#808080` | **5.28:1** | the floor |
| `text-fg/55` | `#8c8c8c` | 6.27:1 | safe |
| `text-fg/65` | `#a6a6a6` | 8.60:1 | safe |

The Two-Neutral Rule says to build hierarchy with opacity but never said how far down it may go, and that gap produced four real contrast failures — the calendar's weekday headers, the date placeholder, and two in the location autocomplete. `/45` is the dangerous one: it looks fine and misses by 0.09.

Disabled and purely decorative text is exempt, which is why the calendar's outside days stay at `/30`. `tests/a11y-contrast.test.tsx` enforces the floor.

## Typography

**Display Font:** Anton (with sans-serif fallback)

**Body Font:** Sora (with sans-serif fallback)

**Label Font:** Sora (with sans-serif fallback)

**Character:** Anton is compressed, loud, and performance-led. Sora is calm and highly legible, giving booking information and controls enough polish to balance the display voice.

### Hierarchy

- **Display** (400, `clamp(32px, 3vw, 38px)`, 0.95): Uppercase section headlines with compact line spacing.
- **Headline** (400, `clamp(22px, 6vw, 26px)`, 1): The centered hero statement, uppercase with subtle tracking.
- **Title** (400, `34px`, 1): Statistics and short display-led proof points.
- **Body** (400, `15px`, 1.625): Paragraphs and form values in sentence case, capped near 65 characters per line.
- **Label** (600, `12px`, 0.08em, uppercase): Navigation, buttons, chips, captions, and compact interface chrome.

### Named Rules

**The Two-Face Rule.** Anton displays. Sora reads and operates. A third typeface is forbidden without a system-level reason.

**The Short-Caps Rule.** Uppercase and tracking belong to headlines and short UI labels. Paragraphs remain sentence case.

## Elevation

The system is flat by default. Depth comes from black and white opacity, 1px grid seams, image layering, light, and motion. Content cards never receive decorative shadows. The calendar popover is the sole conventional floating surface and uses one deep ambient shadow so it separates from the black page.

### Shadow Vocabulary

- **Popover Ambient** (`0 18px 60px rgb(0 0 0 / 0.65)`): Calendar and future floating UI only.
- **Hero Cast Shadow** (dynamic blurred alpha mask): Reserved for the hero portrait and brand mark, where it represents physical stage light rather than card elevation.

### Named Rules

**The Flat Until Floating Rule.** A surface receives a shadow only when it genuinely floats over another interaction layer. If a content card has a shadow, the hierarchy is wrong.

## Components

Components are sharp, direct, and performance-ready. Their hierarchy comes from color role, border weight, spacing, and state. Chips are the intentional pill-shaped exception within an otherwise square system.

### Skip Link

The first focusable element on every route, hidden until it receives focus. It exists because there are eleven tab stops between the logo and the booking form — the page's only conversion — and WCAG 2.4.1 requires a way past them.

- **Hidden state:** `sr-only`. Present in the DOM and to screen readers, invisible on screen.
- **Focused state:** the secondary button treatment — Black fill, 1px White border at 30%, White label, square corners, uppercase `font-ui` at `12px`. Fixed at `top-4 left-6`, above the navigation's stacking context.
- **Target:** `<main id="main-content" tabIndex={-1}>`. The `tabIndex` is required, not decorative: without it several browsers scroll to the target but leave keyboard focus behind, which is the exact failure the link exists to prevent.

### Buttons

- **Shape:** Square corners (`0px`) with compact uppercase Sora labels.
- **Primary:** Ultraviolet, Violet gradient with Black text and `16px 32px` default padding.
- **Hover / Focus:** Increase brightness slightly on hover, retain a visible keyboard focus treatment, and compress to 97% scale on press.
- **Secondary:** Transparent Black surface, 1px White border at 30% opacity, White label, and `12px 24px` padding.

### Chips

Chips come in two families, and the split is semantic rather than decorative. **Colour means interactive.** A user should be able to tell from across the room whether a chip does anything.

**Interactive chips** — the only chips a user can act on. Currently just the budget selector in the booking form.

- **Shape:** Fully rounded pill corners (`9999px`).
- **Resting:** Translucent Violet fill, Violet text, Violet border at 45% opacity.
- **Selected:** Solid Violet with semibold Black text. Selection never uses a gradient.

**Static chips** — read-only labels. Capability lists and the genre row. They are monotone on purpose: nothing about them should suggest a control, and their border is deliberately faint so a long row reads as one texture rather than as ten buttons.

- **On black** (`static`): no fill, White border at 12% opacity, White text at 65%.
- **On the open-format field** (`static-light`): no fill, Black border at 20% opacity, Black text at 80%. The variant is chosen by the surface behind the chip, not by meaning.

A static chip never gains a hover, focus, or selected state. If a chip needs one, it is interactive and takes the accent treatment instead.

**Why the faint border is allowed.** WCAG 1.4.11 requires a 3:1 contrast on the boundary of a *user interface component*, and the static border sits at roughly 1.27:1. That is compliant only because these are not controls — they are text labels with decoration. Measured text contrast stays well clear: 8.6:1 for `static` on black, and 7.1–7.3:1 for `static-light` across the full gradient range. The moment a chip becomes interactive it must take the accent treatment, whose border clears 3:1.

### Cards / Containers

- **Corner Style:** Square (`0px`). The open-format field is bounded but never rounded.
- **Background:** Black for content surfaces; the complete five-stop diagonal gradient for the open-format field.
- **Shadow Strategy:** Flat. Use 1px shared seams and White opacity instead of individual card shadows.
- **Border:** White at 10% to 15% opacity for section dividers and grouped surfaces.
- **Internal Padding:** `20px` mobile content gutters, `56px` desktop gutters, `80px` mobile section rhythm, and `112px` desktop section rhythm.

### Inputs / Fields

- **Style:** Transparent fill, square geometry, Sora body text, and a 2px White underline at 15% opacity.
- **Focus:** Magenta underline with a visible keyboard focus state.
- **Error / Disabled:** Magenta message and underline for errors; submitting states disable the fieldset and reduce the action opacity.
- **Date Picker:** The trigger matches the underlined fields. The floating calendar is Black with White hierarchy, Violet selection, Magenta focus, and Orchid for today. Past dates are visibly disabled.
- **Location Autocomplete:** The venue field accepts cities, venue names, and full U.S. addresses. Its square Black listbox uses White hierarchy and a solid Violet active option, returns no more than six results, and is biased toward the Northeast without excluding other U.S. inquiries. The helper copy spans the full field width. Manual entry must remain available when Geoapify is missing or unavailable. When suggestions are shown, one compact list footer credits both OpenStreetMap and Geoapify; never duplicate attribution below the field.

### Iconography

Icons come from **Lucide** (ISC licensed, ~2,000 icons, tree-shaken). They are drawn at `20px` with a `1.75` stroke — finer than Lucide's stock `2` so they sit with the site's hairline rules rather than competing with Anton display type. JS consumers import `ICON_SIZE` and `ICON_STROKE` from `data/icon-tokens.ts`.

Icons are **decorative**. Adjacent text always carries the meaning, so every icon is `aria-hidden` and none receives a label. An icon that would be the only thing communicating a control's purpose is a layout problem, not an icon problem.

The five event categories each carry one icon, tinted along the same Rose-to-Ultraviolet ramp the numerals used before:

| Category | Icon | Accent |
|---|---|---|
| Weddings | `Gem` | Rose |
| Corporate | `Building2` | Magenta |
| Festivals | `Tent` | Orchid |
| Private | `PartyPopper` | Violet |
| Nightlife | `Disc3` | Ultraviolet |

**The One Icon Library Rule.** Icons come from Lucide at `20px` / `1.75` stroke. A second icon library is forbidden — mixing sets puts two optical grids, two stroke weights, and two corner treatments on one page, which is exactly the incoherence the anti-references call out.

**The Brand Mark Exception.** Third-party brand marks are the one exception, because Lucide ships none — it dropped brand icons for trademark reasons. Instagram, and any future social mark, comes from that brand's own guidelines rather than being redrawn in Lucide's style. Draw it at the same `20px` / `1.75` so the row still reads as one set, and inline it in the component: `currentColor` only inherits when the SVG is part of the document, so a mark loaded through `next/image` would paint black on the black footer.

### Media

The capabilities gallery is a strip of overlapping tiles — five `3:4` surfaces, each pulled `28px` onto the one before it, ascending in z-order.

**This is the one place in the system where surfaces overlap.** Everywhere else uses strict 1px seams and flat, non-overlapping planes. The exception is deliberate: the tiles are a stack of prints, and the overlap is what makes a mixed set of archival photos and modern clips read as one collection rather than five unrelated boxes. It is bounded to this strip — do not carry overlap into cards, grids, or sections.

It also earns the one shadow the **Flat Until Floating Rule** allows outside the calendar popover. Each tile casts left onto the tile it covers (`-14px 0 24px -8px, black at 90%`). Without it the overlap is geometrically correct and visually invisible: five dark tiles read as one flat band.

**Filter — brand duotone at rest, true colour on contact.** Media rests fully desaturated (`grayscale(1) contrast(0.92) brightness(0.88)`) under the brand gradient at `mix-blend-mode: color`, `opacity 0.85`. On hover, focus, or when the tile is the most visible one in view, the media returns to `grayscale(0) contrast(1)` and the overlay fades to `0`, so the tile snaps from brand monochrome to its real colour — the light-rig idea the hero runs on, applied to stills.

**The rest filter compresses luminance on purpose.** Every ramp stop is `oklch(0.78 0.19 H)`, so a brand hue only exists around **L 0.78** — sRGB has no colour that is both bright and saturated. `color` blending drives the source to the backdrop's luminosity, and when that exceeds the gamut the spec's `ClipColor` desaturates the result toward grey. Left at full range, a highlight such as a white shirt under stage light retains about **5%** of the ramp's chroma: it clips to a flat blown-out patch with hard banding. Pulling highlights toward the ramp's own lightness lifts that to roughly **65%**, while midtones — which never clipped — are left untouched. **Raising contrast here brings the posterisation straight back.**

`color` is the load-bearing choice, not `soft-light` or `overlay`: it takes hue and saturation from the overlay and **luminance from the frame beneath**, which recolours the image along the ramp instead of washing over it. It only works because the media is fully desaturated first — any surviving hue fights the mapping. Because the gradient runs diagonally across the whole strip, each tile lands on a different part of the ramp, so the row reads blue through violet to magenta left to right.

This also does real work on inconsistent sources: the set ranges from a 720×480 export to 4K, and full duotone hides that gap far better than a light tint.

**No captions.** Tiles carry no visible label. The imagery speaks, and five labels across an overlapping row competed with the section heading. Each tile is still a button with an `aria-label` describing the shot, so the accessible name survives.

**Colour and playback are two questions, not one.**

*Which tile shows colour* — whichever is most visible, **image or video**. Where the strip scrolls there is often no hover to rely on, so this is the only thing that lifts the duotone. Deriving it from playback instead left photographs tinted permanently, because an image can never be the clip that plays.

*Which video plays* — a strict subset of the above: videos only, one at a time, never under reduced motion. When an image becomes the active tile, playback stops.

- Every clip is `muted`, `loop`, `playsInline`, `preload="none"`, and carries a poster. Nothing downloads until it is wanted.
- Hover is decided **per event**, from `pointerType` on the pointer event, not from a media query. Touch synthesises enter/leave on tap and that is the only thing worth suppressing, so `pointerType === "touch"` is excluded and every other input — mouse, trackpad, pen — works.
- Focus is **never** gated. Tiles are real buttons; hover-only playback is unreachable by keyboard.
- Below the `content` breakpoint, where the strip is a snap scroller, an `IntersectionObserver` selects the most-visible tile and plays it **only if it is a video**. Three simultaneous decodes is the workload phones handle worst.
- **Never gate input on a media query here.** Branching on `(pointer: coarse)` was a bug: it describes the device's *primary* pointer, so a touch laptop, an iPad in desktop mode, or an open device toolbar reported coarse, lost hover entirely, and fell through to an observer running against a row that does not scroll — where every tile is equally visible and one stays lit permanently. `(hover: hover)` is a better guess but still a guess about the device; the event itself is ground truth. The one query that remains asks about **layout**, which is the only thing a media query is actually authoritative on.
- Ties are broken by distance from the viewport centre. With a strict "more visible than" comparison, equally visible tiles never displace the incumbent, which is what pinned the first tile.
- A deliberate hover or focus outranks scroll position when both paths are live at once, and **releasing it hands control back** rather than clearing the strip. Releasing a hover changes no intersection ratio, so the observer has nothing to report and stays silent — falling through to "nothing is active" would strand the centred tile in the duotone, video paused, until the reader scrolls far enough to cross another threshold.
- **Release re-measures the strip; it does not reuse the observer's last snapshot.** The observer only reports on a threshold crossing, so scrolling while a tile is held moves the strip without updating anything — handing back from a cached position would reveal whichever tile *used* to be centred. Layout is read only on release, never on the scroll path, where the observer's own entries are already exact and free.
- Reduced motion: colour still reveals, but nothing autoplays and the active tile does not scale. A cross-fade is not a vestibular trigger; suppressing it left the strip permanently grey for anyone with the preference set.

**Assets.** `public/media/` is generated by `node scripts/build-media.mjs` from masters that are gitignored. Clips are ≤10s, 720p, audio stripped, `+faststart`. A fresh clone cannot regenerate them without the masters.

### Navigation

The navigation is fixed above the hero. At rest it has no plate, allowing the light rig to remain visible. After 24px of scroll, a Black surface at 85% opacity, a 1px White divider at 10%, and a restrained backdrop blur appear. Labels use uppercase Sora at `12px` with `0.12em` tracking. The logo always uses the Violet to Magenta identity asset.

### Footer Contact Actions

The footer is one flat responsive plane. At the `900px` content breakpoint and wider, the Violet-to-Magenta logo sits left of **Text**, **Call**, **Email**, and **Save Contact**, with all four actions held on one line. Below `900px`, the complete action group moves under the centered logo instead of partially wrapping beside it. From `640px` through `899px`, the four actions remain on one line; below `640px`, they may wrap only between complete actions. Icon and label never split internally.

Each action uses uppercase Sora, a Violet Lucide icon at the shared `20px` / `1.75` token, a 44px minimum touch target, a White label, and the existing Violet hover plus Magenta focus treatment.

- **Text:** Opens the device messaging app with `sms:+18604692202`.
- **Call:** Opens the native phone handler with `tel:+18604692202`.
- **Email:** Opens the mail client with `mailto:hello@djknwldg.com`.
- **Save Contact:** Downloads a vCard named `KNWLDG (Omar Tavarez)` with the phone number, booking email, and site URL. The `.vcf` file is the cross-platform source for iPhone and Android; do not replace it with device-sniffing JavaScript.

### Link Hub

`/links` is the page a printed QR code points at, and its constraints come from where it is opened: a phone, held at an event, on venue Wi-Fi, from a camera app. It keeps the identity — the homepage's own framing, with the gradient wordmark running wider than the column behind a portrait cutout on the shared fade stops, and one static Violet wash where the homepage runs its light rig — and drops everything that costs a download.

- **Rows.** Full-width and square-cornered at a `56px` minimum height, with a 1px White border at 30% on Black, a Violet Lucide icon at the shared `20px` / `1.75` token, a White uppercase Sora label, and the muted value right-aligned at White 60%. Hover raises the border to full White; focus keeps the Magenta outline used everywhere else.
- **One gradient row per page.** `BOOK KNWLDG` takes the Ultraviolet-to-Violet primary treatment with a Black label, and every row below it is outline. The same rule the buttons follow.
- **Press is CSS, not JavaScript.** Rows compress to 98% on `:active` rather than through the `Button` component's `whileTap`, because this route ships no client component at all — a hydration bundle bought for a tap scale is the wrong trade on the one page opened over event Wi-Fi. `motion-reduce` parks the compression.
- **No navigation and no footer.** A link hub is the whole viewport, the navigation's section anchors do not exist on this route, and the rows already carry every action the footer offers.

**The QR code.** `public/qr/` is generated by `node scripts/generate-qr.mjs` from `CONTACT.linksUrl`; the page and the code read one value, because a code that has been printed cannot be re-issued.

- **Modules stay pure Black on White** — on the plain code and inside the branded card alike. Every ramp stop is `oklch(0.78 0.19 H)`, roughly 2.5:1 on White, far below what a phone camera needs to decode. Brand colour goes around the code, never in it.
- **No logo is punched into the centre**, so error correction stays at level **M** and the modules stay coarse. Fewer, larger modules read from further away.
- **The 4-module quiet zone is part of the spec, not padding.** Cropping it is the most common way a printed code stops scanning.
- **The outputs are one set, regenerated together or not at all.** A run that cannot render the branded card deletes it and fails rather than leaving one that still points at the old URL beside plain codes pointing at the new one. `public/qr/manifest.json` records the payload and a digest of each file, which is how a stale card is caught in CI — a screenshot cannot be checked by regenerating and comparing bytes.

### Open-Format Field

The square-edged signature field uses the complete five-stop diagonal gradient inside visible Black page gutters. Its heading uses Black Anton, and its genre chips use Black outlines and text. The panel stops short of the viewport edge: `16px` gutters on smaller screens, `48px` at the content breakpoint, and a `1440px` maximum width.

### Motion

Standard reveals animate opacity from 0 to 1 and translate vertically from `16px` to 0 over `600ms` using `cubic-bezier(0.16, 1, 0.3, 1)`. Only transform and opacity animate. Every motion path must provide a real reduced-motion pose. Beat-synced pulses and the WebGL laser choreography belong to the hero only, with the flash rate capped at 3Hz.

## Do's and Don'ts

### Do:

- **Do** use Black, White, and the five named accent colors only.
- **Do** preserve the approved gradient roles and stop order.
- **Do** use square geometry for panels, buttons, fields, cards, and floating surfaces; chips alone use fully rounded pill geometry.
- **Do** keep each section focused on one decision or proof point.
- **Do** keep the `1440px` content cap and use the `900px` content breakpoint before inventing another.
- **Do** use 1px shared seams for repeated content grids.
- **Do** maintain 4.5:1 text contrast, visible focus states, 44px touch targets, and reduced-motion behavior.
- **Do** keep location entry usable without JavaScript suggestions or a successful Geoapify response.
- **Do** verify the animated hero in a GPU-backed browser across multiple frames.

### Don't:

- **Don't** use soft, rounded wedding-template styling beyond the intentional pill shape of chips.
- **Don't** use generic nightlife neon.
- **Don't** use corporate SaaS card layouts.
- **Don't** dilute the established square-edged, dark, magenta-to-violet identity.
- **Don't** introduce gray, cream, tinted-neutral, or unrelated accent colors.
- **Don't** use gradients for text or selected chips.
- **Don't** add decorative card shadows, glassmorphism, or rounded containers.
- **Don't** reuse the hero's beat-synced or WebGL effects elsewhere on the page.
- **Don't** animate width, height, top, left, or any property that triggers layout.
- **Don't** raise the laser flash rate above 3Hz.
