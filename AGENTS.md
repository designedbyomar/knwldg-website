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
principles before making design decisions. See `DESIGN.md` for the normative
visual tokens, component rules, and approved design language.

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
npm run test     # Vitest, once
npm run test:watch
npm run qr       # regenerate public/qr/ from CONTACT.linksUrl
npx tsc --noEmit # typecheck
```

Vitest covers the booking path and the link hub — schema validation, business-date
boundaries, both Redis credential conventions, rate limiting, route ordering,
honeypot handling, the Resend envelope, and the /links hrefs plus its QR
payload. **Nothing covers the hero**, so a
green run says nothing about the laser rig; verify that visually per rule 3.

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
public/qr/      generated QR artwork for /links (npm run qr)
```

`/designsystem` is a rewrite to `public/designsystem.html` (see
`next.config.ts`). Internal reference; deliberately not linked from nav.

`/links` is the link hub a printed QR code points at. It ships no client
component, and `scripts/generate-qr.mjs` reads its URL from `data/contact.ts` —
a printed code cannot be re-issued, so those two must never drift.

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
  real keys. Booking delivery uses `RESEND_API_KEY`, `BOOKING_TO_EMAIL`, and
  `BOOKING_FROM_EMAIL`; location suggestions use the public, referrer-restricted
  `NEXT_PUBLIC_GEOAPIFY_API_KEY`.

## Git workflow

**Never commit or push directly to `main`.** Every change — including one-line
fixes and docs-only edits — goes through a task branch and pull request.

The default delivery workflow is automatic. Do not wait for a separate request
to commit, push, or open the PR after the requested work is complete:

1. Before editing, inspect the current branch, worktree, and related open PRs.
2. If the current branch is `main`, update it and create a focused branch such
   as `<type>/<short-description>`. If the current task already has a suitable
   non-main branch, keep using it.
3. Preserve unrelated work and stage only files that belong to the task.
4. Run the relevant gates. Fix in-scope failures before publishing; if a
   blocker remains, report it instead of publishing broken work.
5. Commit the completed change with a focused, imperative message and push the
   task branch.
6. Check for an open PR from that branch. If none exists, open a ready-for-review
   PR against `main` with a summary and validation notes. If one exists, update
   it by pushing the new commit rather than creating a duplicate PR.
7. Report the branch, commit, PR URL, and verification results.

A branch gets one review lifecycle. If its earlier PR was closed or merged,
start the next task from an up-to-date `main` on a fresh branch rather than
reusing that branch. If work was started on `main` accidentally, create the
task branch before committing and preserve the worktree; never push the commit
to `main`.

The repository owner reviews and merges manually. Never merge a PR, enable
auto-merge, bypass branch protection, force-push, or delete a branch unless the
owner explicitly asks for that separate action.

## Design documentation sync

The live implementation, `DESIGN.md`, and `public/designsystem.html` must tell
the same story. For every design change, explicitly check whether it affects a
reusable visual decision. If it does, update all applicable surfaces in the
same task:

1. Update the implementation in `app/`, `components/`, `data/`, or
   `public/brand/`.
2. Update `public/designsystem.html`, the human-readable visual catalog.
3. Update the normative frontmatter and corresponding prose in `DESIGN.md`.
4. Regenerate `.impeccable/design.json` whenever `DESIGN.md` changes so its
   extensions, component previews, and narrative remain synchronized.

This applies to changes in color tokens, gradient roles, typography, spacing,
layout rules, breakpoints, corner geometry, elevation, motion, accessibility
patterns, component appearance or state, logo treatment, and favicon usage. A
one-off implementation fix does not require documentation churn when the
documented system remains exactly true, but the check is still required. Never
leave a documented example that contradicts the live site.

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
- `DESIGN.md` — normative visual tokens, component rules, and design language.
- `.impeccable/design.json` — machine-readable design extensions and previews.
- `public/designsystem.html` — visual catalog served at `/designsystem`.
- `design-qa.md` — visual QA notes and captures.
- `design_handoff_knwldg_site/` — original design handoff.
- `docs/hero-rig.md` — the hero's architecture and invariants.
- `docs/verifying-visuals.md` — how to verify visual work here honestly.

> **`AUDIT.md` is deliberately untracked and gitignored.** It is the canonical
> status tracker and it should keep being updated locally, but it enumerates
> unfixed defensive gaps — exact rate-limit thresholds, which failures fail open,
> what is unmonitored — and this repository is public. Keep it out of git. If it
> is missing from your checkout, that is expected, not a mistake.

## Known gaps

No public implementation gaps are currently documented here. Keep private
operational and launch-readiness findings in the untracked `AUDIT.md`.
