<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

> Everything above this line is managed by `next dev`. It is rewritten in place
> between its markers; text outside them is preserved, so the rest of this file
> is safe. Do not move or delete the block — the dev server puts it back, which
> shows up later as an unexplained dirty file.

# KNWLDG site

Marketing site for KNWLDG, an open-format DJ working weddings, corporate
events, festivals, private events and nightlife across Connecticut, the NYC
metro, western Massachusetts and the wider Northeast. It is one long-form
landing page; the only conversion is the booking inquiry form at `#booking`.

See `PRODUCT.md` for users, brand personality, anti-references and design
principles before making design decisions.

## Stack

| What | Notes |
|---|---|
| **Next.js 16.3**, App Router | Requires Node `>=20.9` (repo runs 20.20). Read `node_modules/next/dist/docs/` before writing Next code — this release differs from training data. |
| **React 19.2**, TypeScript strict | `LayoutProps<"/">` in `app/layout.tsx` is a generated typed-routes global, not a hand-written type. Don't "fix" it into an interface. |
| **Tailwind v4** | CSS-first. Design tokens live in the `@theme` block at the top of `app/globals.css`. **There is no `tailwind.config`** and one should not be created. |
| **Motion 13** (`motion/react`) | `useReducedMotion()` is a real branch throughout the hero, not decoration. |
| **three 0.185 + @react-three/fiber 9 + postprocessing** | Hero only, dynamically imported behind a capability gate. Nothing else on the page touches WebGL. |
| **Zod 4 + react-hook-form** | `lib/validations/booking-schema.ts` is shared by the client form and the API route — one schema, both sides. |
| **Resend** | Booking email delivery. |
| radix-ui, react-day-picker, date-fns, lucide-react | Date picker and popover in `components/ui/`. |
| culori | Colour maths in `data/theme-tokens.ts`. |

## Commands

```bash
npm run dev      # Turbopack dev server on :3000
npm run build    # production build (Turbopack). Also passes with `npx next build --webpack`
npm run start    # serve the production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

**There is no test runner.** No `test` script, no test files, no framework
installed. `npx tsc --noEmit` and `npm run lint` are the only automated gates —
do not claim "tests pass". `AUDIT.md` tracks a test suite as pending.

`@next/bundle-analyzer` is installed but not wired into `next.config.ts`.

## Layout

```
app/            routes, globals.css (@theme tokens), api/booking/route.ts
components/
  layout/       nav, footer, container
  sections/     one file per page section, plus the hero's supporting parts
  three/        the WebGL laser rig and its shared clock/choreography
  ui/           button, chip, reveal, calendar, date-picker, popover
data/           page copy and lists, plus the brand colour ramp
lib/            cn(), resend client, validations/
public/brand/   logo, portrait, and the alpha-only portrait mask
```

`/designsystem` is a rewrite to `public/designsystem.html` (see
`next.config.ts`). Internal reference; deliberately not linked from nav.

## Conventions

- `@/*` resolves to the repo root.
- **Server components by default.** `"use client"` goes on the smallest leaf
  that needs it — most of `components/sections/` is server-rendered and pushes
  the boundary down into small client components.
- `cn()` from `lib/utils.ts` for class merging.
- Copy and lists belong in `data/*.ts`, not inline in components.
- Colours: CSS consumers use the `@theme` tokens; JS and shader consumers use
  `data/theme-tokens.ts`.
- Env: copy `.env.example` to `.env.local`. `.env*` is gitignored; never commit
  real keys. Vars are `RESEND_API_KEY`, `BOOKING_TO_EMAIL`, `BOOKING_FROM_EMAIL`.

## Rules that are load-bearing

These look like arbitrary numbers or style choices. They are not, and each is
one confident cleanup away from breaking something real.

1. **Flash rate is capped for accessibility.** `PULSE_BPM = 132` was chosen
   because it puts the rig at 2.2Hz, under the WCAG 2.3.1 three-flashes-per-
   second ceiling. `STROBE_HZ` must stay ≤ 3 — never raise
   `STROBE_FLASHES_PER_BEAT`. For more punch use `STROBE_DUTY` or
   `STROBE_BURST_BARS` instead.
2. **Verify WebGL in a GPU-backed browser.** Headless Chromium here reports
   `webgl2: false`, so `useLaserTier()` returns `"off"`, the rig never mounts,
   and you are looking at the CSS fallback while believing you are looking at
   the beams. See `docs/verifying-visuals.md`.
3. **Never judge the animated hero from a single screenshot.** Its colour
   depends on where the spotlight currently is. Sample across frames and report
   a distribution.
4. **Shader colours must be linear light.** Pass them through
   `srgbTupleToLinear` (`data/theme-tokens.ts`). three renders in a linear space
   and encodes to sRGB on output, so display-referred values get encoded twice.
5. **`clampChroma` before converting the brand ramp to sRGB.** Every stop
   (L 0.78 / C 0.19) is out of sRGB gamut; a raw convert silently clamps and
   flattens all five hues toward the same pale blue.
6. **A CSS `mask-image: url()` bypasses `next/image`.** Use
   `public/brand/knwldg-photo-mask.png` (alpha-only, ~29KB) as a stencil, never
   `knwldg-photo.png` (1.9MB), or you ship the unoptimised original twice.
7. **The portrait's fade stops live once**, in
   `components/sections/hero-fade.ts`. The portrait mask, its cast shadow and
   the black floor scrim all consume them and must agree.
8. **Reduced motion is implemented, not stubbed.** Every animated layer parks at
   a real pose and skips its frame loop. Keep that shape when adding layers.

## The hero

The hero is the only intricate part of this codebase and its invariants are
invisible from the call sites. Read **`docs/hero-rig.md`** before changing
anything in `components/three/` or `components/sections/hero*`.

## Other docs

- `PRODUCT.md` — users, brand personality, anti-references, design principles.
- `AUDIT.md` — canonical status tracker. Update it when work lands.
- `design-qa.md` — visual QA notes and captures.
- `design_handoff_knwldg_site/` — original design handoff.
- `docs/verifying-visuals.md` — how to verify visual work here honestly.

> `PRODUCT.md`, `AUDIT.md` and `design-qa.md` are currently **untracked**. A
> fresh clone will not have them. Commit them or treat their absence as normal.

## Known gaps

`AUDIT.md` is the tracker; two live issues it does not cover:

- Scroll reveals ship `opacity:0` inline in the server HTML
  (`components/ui/reveal.tsx`), so with JS disabled everything below the hero is
  invisible. Text is still in the DOM for crawlers that parse HTML.
- The footer Instagram link points at the bare domain with no handle.
