# The hero laser rig

The hero is a WebGL beam rig, two DOM spotlights, two cast shadows and a portrait
that dissolves into black — all driven from one clock. Most of its constants look
arbitrary at the call site and are not. Read this before changing anything in
`components/three/` or `components/sections/hero*`.

## Layer order

The hero `<section>` sets `[isolation:isolate]`, so all blending is contained.
Back to front:

| z | Layer | Why it exists |
|---:|---|---|
| 0 | `LaserFallback` | Static CSS beams. First paint before the rig mounts, and the **only** beams the `off` tier ever gets. Hidden (`opacity: 0`) once `[data-laser="live"]` is set, because it never moves and doubles the real beams. |
| 5 | Two `HeroLightPool` discs | The light the spotlights cast. Below the canvas on purpose: light lands on the back wall, beams hang in the air in front of it. |
| 10 | WebGL canvas | `LaserHeroSceneLoader` → `LaserHeroScene` → `LaserBeams`. |
| 30 | Wordmark | Plus its cast shadow and a masked highlight pool. |
| 35 | Black floor scrim | Gives the portrait real black to dissolve into. |
| 40 | Portrait | Plus its cast shadow and a masked highlight pool. |
| 50 | Headline, copy, CTA | |

The single most confusing past bug: beams appeared to shine *through* the
subject even though the canvas is correctly behind him. The cause was not
z-order — the portrait's own bottom fade makes him translucent well before the
beam layer started fading, so you were seeing correctly-behind beams through a
see-through subject. The fix was the scrim, not the z-index.

## The shared clock

`laser-clock.ts` reads `performance.now()` against a fixed module epoch.
Deliberately **not** `THREE.Clock`: R3F flips `frameloop` to `"never"` when the
hero scrolls out or the tab hides, and `THREE.Clock` stops accumulating while
paused, so it drifts further from wall time on every pause. The DOM layers run
their own `requestAnimationFrame` loops and would slide out of sync with the
beams.

Everything downstream is a **pure function of an absolute beat number**:

- `sampleBeam(i, n, beat, out, lookBars)` — one beam's angle and intensity
- `sampleSpot(beat, out, channel)` — a spotlight's position and intensity
- `sampleStrobe(beat)` — the strobe gate, `1` lit / `0` gated

That is what lets the WebGL scene and the DOM pools render the same moment with
no message passing between them. Keep new layers on the same contract; do not
introduce shared mutable state or an event bus.

## Choreography

`laser-choreography.ts`.

**Looks.** Six named looks — `fan`, `chase`, `wave`, `snap`, `cross`, `breathe` —
cycling on a bar grid (`LOOK_BARS = 4`, `LOOK_CROSSFADE_BEATS = 2`). Every look
writes an absolute angle inside `±FAN_SPREAD/2`, which is the invariant that
makes the crossfade a naive lerp: two looks can never be more than a fan's width
apart, so a transition reads as repositioning rather than a spin. The incoming
look is sampled at the same absolute beat as the outgoing one, so it arrives
already mid-motion and nothing pops.

**Spotlights.** Two channels:

- `lead` — violet, hues 280 → 260
- `counter` — rose (`#ff81dd`, which is the `--color-rose` token), hues 340 → 320

`counter` mirrors `nx` and inverts the `ny` oscillation **around
`SPOT_CENTER_Y`**, not around zero. That is what keeps both inside the safe band
`ny ∈ 0.26..0.54`. The band matters: the hero's vertical middle sits inside the
portrait's fade region, and a light there relights the exact area meant to be
dissolving. Intensity is *not* mirrored — the pair breathes together as one rig.

`SPOT_PARK_BEAT` is where reduced-motion callers park. It is a quarter into the
X sweep rather than beat 0, because at beat 0 both fixtures sit at `nx = 0` and
stack into what reads as a single light.

**Strobe.** Bursts occupy the last `STROBE_BURST_BARS` of every
`STROBE_PERIOD_BARS`, gating as a square wave — real strobes do not ease.

## Accessibility ceiling

`PULSE_BPM = 132` is not a taste decision. It puts the rig at 2.2Hz, under the
WCAG 2.3.1 limit of no more than three flashes in any one-second period. The
strobe subdivides at the beat and no finer for the same reason:

```
STROBE_FLASHES_PER_BEAT = 1  ->  STROBE_HZ = 2.2   ok
                          2  ->              4.4   fails
                          4  ->              8.8   fails badly
```

Measured on the live page, the current settings produce 3 flashes in the worst
one-second window — compliant, but *at* the limit rather than under it. Any
change that increases the rate needs re-measuring, not reasoning. For more
punch, reach for `STROBE_DUTY` or `STROBE_BURST_BARS`.

## Tiers

`use-laser-tier.ts` returns `off` / `reduced` / `full`.

| Tier | When | Gets |
|---|---|---|
| `off` | reduced motion, no WebGL2, ≤2 cores, <4GB, saveData, 2g | CSS fallback only, at 0.7 opacity. The three.js chunk is never fetched. |
| `reduced` | coarse pointer, <768px, or <6 cores | The real rig: 5 beams, no post-processing pass, slower look cycle |
| `full` | everything else | 9 beams, bloom + tone mapping |

Only `full` renders the **masked highlight pools** on the wordmark and portrait —
each forces an offscreen composite every frame it moves. The backdrop discs are
never gated: they are plain CSS gradients and the hero's main light source, not a
WebGL embellishment.

Note the reduced tier has no composer, so its framebuffer clamps at 1.0 with no
HDR headroom — hence its lower `coreGain` and lifted `haloGain`.

## Masks and the fade chain

Three px offsets, measured live rather than guessed:

- `--laser-cutoff` — the portrait's measured bottom edge
- `--hero-fade-start` — where the portrait *starts* going translucent, i.e.
  `top + PORTRAIT_FADE_START * height`

Both are written onto the `<section>` by `laser-hero-scene-loader.tsx` under a
`ResizeObserver`, so everything tracks at every breakpoint.

Consumers:

- **Beam mask** (`laser-mask.ts`) fades from `cutoff - LASER_FADE_START_PX` to
  `cutoff - LASER_FADE_END_PX`. Deliberately gentle. Occluding the beams behind
  the translucent portrait is the *scrim's* job — making the mask do it forced
  the fade to start so high that the beam emitter sat inside its own fade band,
  which is why the whole fan had to originate above his head.
- **Scrim** (in `hero.tsx`) starts at `--hero-fade-start` and reaches
  `--color-bg` at `cutoff - SCRIM_SETTLE_PX`. Black has to be arriving already by
  the time you can see through him.
- **Portrait + its cast shadow** carry `PORTRAIT_FADE_MASK` from
  `hero-fade.ts`. All three must agree; the constants live there once.

The WebGL layer additionally fades itself in the shader (`uCutoffNdc`,
`uCutoffBand`, fed as ratios so they track hero height) because an ancestor CSS
mask does not reliably clip a composited canvas.

## Blending

- `.hero-glow` → `plus-lighter` (falling back to `screen`). Purely additive.
- `.hero-glow-disc` → `hard-light`, overriding the above. Declared after it in
  `globals.css`; same specificity, later wins.

Over the hero's black ground, `hard-light` resolves to `max(0, 2·Cs − 1)`. The
disc's colours sit above 0.5 luminance so the core lands in the screen half and
survives, while the soft outer stops fall to black — that is what gives the disc
a rim instead of a haze. It also means hard-light **dims** what survives, so disc
`strength` is lower than it was under the additive blend.

The masked pools stay additive on purpose: hard-light flattens the wordmark's
blue-to-pink gradient toward a uniform lavender.

**Do not use `mask-composite` to intersect two masks here.** Clipping the
portrait highlight to both its alpha and its bottom fade via
`mask-composite: intersect` / `-webkit-mask-composite: source-in` did not
reliably intersect in testing — it painted the pool as an unmasked rectangle over
the whole portrait box. Use nested elements with one mask each.

## Colour pipeline

`data/theme-tokens.ts` exists because two conversions are easy to get wrong.

1. **Gamut.** Every brand ramp stop is `L 0.78 / C 0.19`, which is outside sRGB.
   A raw convert returns channels above 1.0 that silently clamp, flattening all
   five hues toward the same pale blue-white. `clampChroma` holds hue and
   lightness and drops only chroma, which keeps the stops distinguishable.
2. **Transfer function.** `srgbTupleToLinear` is the only form that may reach a
   shader. three renders in a linear working space and encodes to sRGB on the
   way out, so handing it display-referred values encodes them twice.

`BRAND_RAMP_SRGB` for CSS/canvas 2D, `BRAND_RAMP_LINEAR` for WebGL.

## Cast shadows

`hero-cast-shadow.tsx` renders a copy of the asset as a black silhouette behind
it: `filter: brightness(0) blur(Npx)` — `brightness(0)` zeroes RGB while leaving
alpha alone, so it traces the cutout rather than the bounding box.

The filter is static and rasterises once; only `transform` animates, which keeps
it on the compositor. Animating `filter: drop-shadow` instead would re-rasterise
the blur every frame.

Two things that matter:

- It mounts as the **first child** of the subject's own wrapper, so it paints
  behind the image inside that wrapper's stacking context. The portrait's shadow
  therefore lands on the wordmark, which is the only place a black silhouette has
  anything to register against — against the near-black background it is
  invisible.
- The portrait's shadow must carry the same bottom-fade mask as the portrait, or
  the blur spreads past where he has already dissolved and paints a soft dark
  rectangle.

It uses `next/image` with props identical to the real image so both resolve to
the same `/_next/image` URL and the second one is a cache hit. A plain `<img>`
would bypass the optimiser and pull the 1.9MB original again.

## Reduced motion

Every animated layer checks `useReducedMotion()`, parks at a real pose, and
returns before starting its frame loop. Two consequences worth keeping:

- The strobe is never reached on that path — a flashing light is exactly what
  the preference is asking us not to do.
- The discs still render. They are the hero's main light source; hiding them
  leaves a flat black panel.

Note that `Emulation.setEmulatedMedia` is blocked by the browse CDP allowlist, so
this path is verified by code inspection, not by a browser. Say so when you
report on it.
