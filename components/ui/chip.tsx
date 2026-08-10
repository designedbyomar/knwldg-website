import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const BASE = "font-ui text-xs tracking-normal inline-block transition-colors";

const VARIANTS = {
  violet: "border border-violet/45 bg-violet/12 text-violet px-4 py-2",
  "outline-dark": "border border-ink/30 text-ink/85 px-4.5 py-2.5",
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
  variant = "violet",
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
