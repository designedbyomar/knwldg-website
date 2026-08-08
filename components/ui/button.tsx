import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const BASE =
  "inline-block font-ui text-sm font-semibold tracking-[0.06em] uppercase transition-colors";

const VARIANTS = {
  gradient: "brand-gradient text-ink px-8 py-4 hover:brightness-[1.06]",
  outline:
    "border border-fg/30 text-fg px-6 py-3 hover:border-fg hover:text-fg",
} as const;

type Variant = keyof typeof VARIANTS;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: undefined;
};

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  href: string;
};

export function Button({
  variant = "gradient",
  className,
  ...props
}: ButtonProps | LinkProps) {
  const classes = cn(BASE, VARIANTS[variant], className);

  if ("href" in props && props.href) {
    return <a className={classes} {...(props as LinkProps)} />;
  }

  return (
    <button className={classes} {...(props as ButtonProps)} />
  );
}
