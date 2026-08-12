"use client";

import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

const BASE =
  "inline-block font-ui text-sm font-semibold tracking-[0.06em] uppercase transition-colors";

const VARIANTS = {
  gradient: "brand-gradient-ultraviolet-violet text-ink px-8 py-4 hover:brightness-[1.06]",
  outline:
    "border border-fg/30 text-fg px-6 py-3 hover:border-fg hover:text-fg",
} as const;

type Variant = keyof typeof VARIANTS;

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<"button">> &
  HTMLMotionProps<"button"> & {
    variant?: Variant;
    href?: undefined;
  };

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof HTMLMotionProps<"a">> &
  HTMLMotionProps<"a"> & {
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
    return (
      <motion.a whileTap={{ scale: 0.97 }} className={classes} {...(props as LinkProps)} />
    );
  }

  return (
    <motion.button whileTap={{ scale: 0.97 }} className={classes} {...(props as ButtonProps)} />
  );
}
