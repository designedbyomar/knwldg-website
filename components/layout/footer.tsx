import Image from "next/image";
import { Mail } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ICON_SIZE, ICON_STROKE } from "@/data/icon-tokens";

/**
 * Instagram is inlined rather than pulled from Lucide, which ships no brand
 * marks at all. See DESIGN.md > Iconography: a third-party mark comes from
 * that brand's own guidelines and is never redrawn in Lucide's style.
 *
 * Inlined rather than loaded from public/ because `currentColor` only inherits
 * when the SVG is part of the document; via next/image it would render as an
 * <img> and paint black on a black footer. Drawn at the same size and stroke
 * as the Lucide icons beside it so the row reads as one set.
 */
function InstagramMark() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SOCIAL_LINK = "text-fg/55 transition-colors hover:text-fg";

export function Footer() {
  return (
    <footer className="bg-bg-footer">
      {/* Three tracks so the locations line is centred against the footer
          itself rather than against whatever the logo and socials happen to
          measure. Stacks and centres on mobile. */}
      <Container className="grid grid-cols-1 items-center gap-6 px-6 py-9 text-center sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-14">
        <div className="flex justify-center sm:justify-start">
          <Image
            src="/brand/knwldg-mark-gradient.svg"
            alt="KNWLDG"
            width={96}
            height={48}
            className="h-auto w-24"
          />
        </div>

        <div className="font-ui text-xs leading-relaxed text-fg/50">
          Connecticut &middot; NYC Metro &middot; Western Massachusetts &middot; Northeast
        </div>

        <div className="flex justify-center gap-5 sm:justify-end">
          <a
            href="https://www.instagram.com/djknwldg/"
            aria-label="KNWLDG on Instagram"
            className={SOCIAL_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <InstagramMark />
          </a>
          <a href="mailto:hello@djknwldg.com" aria-label="Email KNWLDG" className={SOCIAL_LINK}>
            <Mail size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
          </a>
        </div>
      </Container>
    </footer>
  );
}
