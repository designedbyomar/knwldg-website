# Notice — what the licence does and does not cover

The [MIT licence](./LICENSE) covers the **source code** in this repository. Take
it, learn from it, build on it, ship it commercially — no permission needed.

It does **not** cover the brand. The following are
**© 2026 Omar Tavarez, all rights reserved**, and no licence to them is granted
by the MIT terms or by their presence in this repository:

| Reserved | |
|---|---|
| Photographs | `public/brand/knwldg-photo.png`, `public/brand/knwldg-photo-mask.png`, `design_handoff_knwldg_site/assets/knwldg-photo.png` |
| Logo and wordmark | `public/brand/knwldg-mark.svg`, `public/brand/knwldg-mark-gradient.svg`, `design_handoff_knwldg_site/assets/knwldg-mark*.svg` |
| Name and marks | "KNWLDG", and any confusingly similar variation |
| Copy | The written content in `data/` describing KNWLDG's services and experience |

The photographs are original works by Omar Tavarez, who holds copyright in them.

## No impersonation

You may not use the reserved assets, the KNWLDG name, or the likeness depicted
in the photographs to represent yourself as KNWLDG or Omar Tavarez, or to imply
affiliation with, sponsorship by, or endorsement from either.

This is the one restriction that matters here. Everything else is fair game.

## Using this as a starting point

If you want to build your own site from this code, that is expressly welcome.
Replace these before deploying anything public:

1. **`public/brand/`** — swap every asset for your own.
2. **`data/`** — replace the copy, service list, genres and stats.
3. **`app/layout.tsx`** — change the `metadata` title and description.
4. **`components/layout/footer.tsx`** and `nav.tsx` — replace contact details and
   social links.

Once those are yours, nothing reserved above remains and the MIT licence covers
everything you are shipping.

## Trademark

MIT is silent on trademarks — unlike Apache 2.0, it neither grants nor withholds
them. This notice exists to state the position explicitly rather than leave it
to inference: no trademark rights are granted.
