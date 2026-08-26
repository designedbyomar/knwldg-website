# KNWLDG

Marketing site for KNWLDG, an open-format DJ working weddings, corporate events,
festivals, private events and nightlife across Connecticut, the NYC metro,
western Massachusetts and the wider Northeast.

One long-form landing page. The only conversion is the booking inquiry form,
which emails through [Resend](https://resend.com).

## Requirements

- Node `>=20.9` (Next.js 16 requirement)
- npm

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open <http://localhost:3000>.

The visual site runs without environment configuration. The booking endpoint
requires the production variables below and returns a user-safe `503` when its
rate-limit or email infrastructure is unavailable. In local development only,
the rate limiter is bypassed when Upstash is not configured; email still
requires all three Resend variables.

### Environment

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` or `KV_REST_API_URL` | REST URL for the shared Upstash Redis database. The Vercel Marketplace integration currently injects the `KV_` name. |
| `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_TOKEN` | Secret REST token for that database. The Vercel Marketplace integration currently injects the `KV_` name. |
| `RATE_LIMIT_SALT` | Private random value used to HMAC client addresses before they become Redis identifiers. |
| `RESEND_API_KEY` | Production Resend API key. |
| `BOOKING_FROM_EMAIL` | Required sender on the verified domain: `KNWLDG Bookings <bookings@djknwldg.com>`. |
| `BOOKING_TO_EMAIL` | Required delivery inbox: `hello@djknwldg.com`. |
| `NEXT_PUBLIC_GEOAPIFY_API_KEY` | Public, referrer-restricted Geoapify key used for venue, city, and address suggestions. Manual entry remains available when it is omitted or unavailable. |

`.env*` is gitignored. Never commit real keys.

The booking route allows 10 attempts per client address in a sliding one-hour
window. Preview and Production use separate Redis prefixes. Addresses are HMAC
hashed before use, and Upstash analytics is disabled. A one-second Upstash
timeout fails open with a non-identifying warning; missing or rejected
production infrastructure fails closed.

### Vercel launch setup

1. Connect the repository to Vercel and link a US-region Upstash Redis database
   to Preview and Production. The limiter accepts both direct Upstash
   `UPSTASH_REDIS_REST_*` variables and the Vercel Marketplace
   `KV_REST_API_*` variables.
2. Generate a private random `RATE_LIMIT_SALT` and add it to both environments.
3. Verify `djknwldg.com` in Resend, create a production API key, and set the
   three booking email variables exactly as shown in `.env.example`.
4. Create a free Geoapify project, restrict its generated API key to the
   production, preview, and local HTTP referrers, then add it as
   `NEXT_PUBLIC_GEOAPIFY_API_KEY`. The key is intentionally public in the
   browser, so referrer restrictions are required.
5. Redeploy, then submit one real inquiry and verify delivery and reply-to
   behavior before directing traffic to the site.

## Commands

```bash
npm run dev      # Turbopack dev server on :3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npm run test     # Vitest suite once
npm run test:watch # Vitest in watch mode
npm run qr       # regenerate the /links QR artwork in public/qr/
npx tsc --noEmit # typecheck
```

## Layout

```
app/            routes, globals.css (design tokens), api/booking
components/
  layout/       nav, footer, container
  sections/     one file per page section
  three/        the WebGL laser rig used by the hero
  ui/           shared primitives
data/           page copy, lists, and the brand colour ramp
lib/            helpers, Resend client, Zod schemas
public/brand/   logo, portrait, portrait mask
public/qr/      generated QR artwork for /links
```

Design tokens (colour, type, breakpoints) live in the `@theme` block at the top
of `app/globals.css`. This is Tailwind v4 — there is no `tailwind.config`.

`/designsystem` serves an internal design-system reference. It is intentionally
not linked from the nav.

`/links` is the mobile link hub a printed QR code points at. Its artwork lives in
`public/qr/` and is regenerated with `npm run qr`, which reads the destination
from `data/contact.ts` so the page and the printed code cannot drift apart.

## Contributing

Read [`AGENTS.md`](./AGENTS.md) first. It covers the conventions and, more
importantly, the constants in the hero that look arbitrary but are load-bearing —
including an accessibility ceiling on the strobe rate.

If you are touching the hero, also read [`docs/hero-rig.md`](./docs/hero-rig.md)
and [`docs/verifying-visuals.md`](./docs/verifying-visuals.md).

## Licence

The **code** is [MIT](./LICENSE) — use it, modify it, ship it commercially, no
permission needed.

The **brand is not**. The KNWLDG name, the logo and wordmark, and the
photographs are © 2026 Omar Tavarez, all rights reserved, and are excluded from
the MIT grant. You may not use them to represent yourself as KNWLDG or imply
affiliation or endorsement.

Building your own site from this is welcome — see [`NOTICE.md`](./NOTICE.md) for
exactly what is reserved and the four things to replace before you deploy.
