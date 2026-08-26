import { ICON_SIZE, ICON_STROKE } from "@/data/icon-tokens";

type InstagramMarkProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

/**
 * The Instagram glyph, drawn from Instagram's own mark rather than redrawn in
 * Lucide's style. See DESIGN.md > Iconography > The Brand Mark Exception:
 * Lucide dropped brand icons for trademark reasons, so this is the one place a
 * mark comes from outside the library.
 *
 * Two things keep it in the same set as its Lucide neighbours: the shared
 * 20px / 1.75 tokens, and `currentColor`. It is inlined rather than loaded
 * through next/image because `currentColor` only inherits when the SVG is part
 * of the document - as an <img> it would paint black on a black row.
 */
export function InstagramMark({
  size = ICON_SIZE,
  strokeWidth = ICON_STROKE,
  className,
}: InstagramMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}
