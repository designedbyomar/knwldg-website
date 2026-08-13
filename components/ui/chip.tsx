import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const BASE = "inline-block rounded-full font-ui text-xs tracking-normal transition-colors";

/**
 * Two families, and the split is semantic rather than decorative:
 *
 * - `interactive` is the only variant a user can act on. It carries an accent
 *   colour and a `selected` state, so colour means "this responds to you".
 * - `static-*` variants are read-only labels. They are monotone on purpose:
 *   nothing about them should suggest a control. Their border is deliberately
 *   faint so a long row of them reads as one texture, not as ten buttons.
 *
 * Picking `static` vs `static-light` is about the surface behind the chip, not
 * about meaning: `static` sits on the black page, `static-light` on the
 * open-format gradient field where ink is the readable colour.
 */
const VARIANTS = {
  interactive: "border border-violet/45 bg-violet/12 text-violet px-4 py-2",
  static: "border border-fg/12 text-fg/65 px-4 py-2",
  "static-light": "border border-ink/20 text-ink/80 px-4.5 py-2.5",
} as const;

type ChipVariant = keyof typeof VARIANTS;

type ChipSpanProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: ChipVariant;
  selected?: boolean;
  as?: "span";
};

type ChipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipVariant;
  selected?: boolean;
  as: "button";
};

export function Chip({
  variant = "static",
  selected,
  className,
  as = "span",
  ...props
}: ChipSpanProps | ChipButtonProps) {
  const classes = cn(
    BASE,
    VARIANTS[variant],
    selected && "border-violet bg-violet font-semibold text-ink",
    className
  );

  if (as === "button") {
    return <button type="button" className={classes} {...(props as ChipButtonProps)} />;
  }

  return <span className={classes} {...(props as ChipSpanProps)} />;
}
