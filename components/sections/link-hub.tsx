import Image from "next/image";
import { ICON_SIZE, ICON_STROKE } from "@/data/icon-tokens";
import { LINK_HUB, LINK_ROWS } from "@/data/links";
import { PORTRAIT_FADE_MASK } from "./hero-fade";

const MARK_SRC = "/brand/knwldg-mark-gradient.svg";
const PHOTO_SRC = "/brand/knwldg-photo.png";

/**
 * The link hub behind the printed QR code.
 *
 * Everything here is a deliberate departure from the homepage, and all of it
 * comes from where the page is opened: a phone, held at an event, on venue
 * Wi-Fi, from a camera app.
 *
 * - **No client component anywhere on the route.** The rows are plain anchors
 *   and the press compression is CSS `:active`, not the `Button` component -
 *   that one is a client component pulling `motion` in purely for `whileTap`.
 *   Nothing here hydrates, so the only JS is Next's own router runtime: 237KB
 *   against the homepage's 1.77MB. See DESIGN.md > Components > Link Hub.
 * - **None of the hero rig.** No WebGL, no beat clock, no light pools. The one
 *   brand flourish is a static radial wash behind the wordmark, so there is
 *   nothing to park for reduced motion beyond the press scale.
 * - It still reuses the hero's assets and, importantly, its fade stops: the
 *   portrait mask comes from hero-fade.ts rather than being retyped here.
 */

/** Static stand-in for the hero's light pools - one wash, no frame loop. */
const WASH: React.CSSProperties = {
  background:
    "radial-gradient(78% 46% at 50% 0%, color-mix(in oklab, var(--color-violet) 30%, transparent) 0%, transparent 72%)",
};

const ROW =
  "flex min-h-14 items-center gap-3 px-4 transition duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magenta motion-reduce:transition-none motion-reduce:active:scale-100";

const LABEL = "font-ui text-xs font-semibold uppercase tracking-[0.08em]";

export function LinkHub() {
  const PrimaryIcon = LINK_HUB.primary.icon;

  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-bg px-5 pt-12 pb-14">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[420px]"
        style={WASH}
      />

      <div className="relative mx-auto flex w-full max-w-[26rem] flex-col">
        <Image
          src={MARK_SRC}
          alt="KNWLDG"
          width={820}
          height={410}
          priority
          className="mx-auto h-auto w-[190px]"
        />

        <Image
          src={PHOTO_SRC}
          alt=""
          width={1253}
          height={1474}
          priority
          // Same dissolve the hero uses, from the same constants. The portrait
          // has to reach true black before the two copy lines, or they land on a
          // shirt instead of on the page ground.
          style={{
            WebkitMaskImage: PORTRAIT_FADE_MASK,
            maskImage: PORTRAIT_FADE_MASK,
          }}
          className="mx-auto -mt-2 h-auto w-[236px]"
        />

        <p
          className={`-mt-6 text-center ${LABEL} text-[11px] leading-relaxed text-balance text-fg/70`}
        >
          {LINK_HUB.tagline}
        </p>

        <p className="mt-2 text-center font-ui text-[11px] leading-relaxed text-balance text-fg/60">
          {LINK_HUB.services}
        </p>

        <nav
          aria-label="Contact and book KNWLDG"
          className="mt-7 flex flex-col gap-3"
        >
          <a
            href={LINK_HUB.primary.href}
            className={`${ROW} brand-gradient-ultraviolet-violet justify-center text-ink hover:brightness-[1.06]`}
          >
            <span aria-hidden className="shrink-0">
              <PrimaryIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </span>
            <span className="font-ui text-sm font-semibold tracking-[0.06em] uppercase">
              {LINK_HUB.primary.label}
            </span>
          </a>

          {LINK_ROWS.map(
            ({ label, value, href, icon: Icon, download, external }) => (
              <a
                key={label}
                href={href}
                download={download}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={`${ROW} border border-fg/30 hover:border-fg`}
              >
                <span aria-hidden className="shrink-0 text-violet">
                  <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                </span>
                <span className={`${LABEL} text-fg`}>{label}</span>
                {value ? (
                  <span className="ml-auto truncate pl-3 font-ui text-[11px] text-fg/60">
                    {value}
                  </span>
                ) : null}
              </a>
            ),
          )}
        </nav>
      </div>
    </section>
  );
}
