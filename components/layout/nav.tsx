"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ICON_SIZE, ICON_STROKE } from "@/data/icon-tokens";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "EVENTS", href: "#events" },
  { label: "MUSIC", href: "#genres" },
];

const SCROLL_THRESHOLD = 24;

// Fixed (not sticky) so it never reserves its own space in the page flow -
// the hero section starts at the true top of the page and its laser effect
// paints all the way behind this bar. The logo/links always render; only
// the backing plate (background/border/blur) toggles once scrolling starts.
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape and on any click outside the panel. Both are listed
  // because a menu you can only close by hitting the same button again is a
  // trap on touch, where there is no hover affordance to hint at that.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // The panel only exists under the `content` breakpoint, so a viewport that
  // grows past it while the menu is open would strand an invisible open state.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia("(min-width: 56.25rem)");
    const onChange = () => query.matches && setOpen(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        (scrolled || open) && "border-b border-fg/10 bg-bg/85 backdrop-blur-md"
      )}
    >
      <Container className="flex items-center justify-between px-6 py-6 sm:px-14">
        <Link href="/" className="block w-20 shrink-0" aria-label="KNWLDG home">
          <Image
            src="/brand/knwldg-mark-gradient.svg"
            alt="KNWLDG"
            width={80}
            height={40}
            priority
            className="h-auto w-20"
          />
        </Link>

        <nav className="flex items-center gap-6 font-ui text-xs tracking-[0.12em] text-fg/85 content:gap-8">
          {/* Links collapse into the panel below the content breakpoint. */}
          <div className="hidden items-center gap-8 content:flex">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-fg">
                {link.label}
              </a>
            ))}
          </div>

          {/* BOOK stays visible at every width - it is the page's only
              conversion, so it never hides behind a menu. */}
          <Button href="#booking" variant="gradient" className="px-4.5 py-2 text-xs">
            BOOK
          </Button>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-1 p-1 text-fg/85 transition-colors hover:text-fg content:hidden"
          >
            {open ? (
              <X size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
            ) : (
              <Menu size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
            )}
          </button>
        </nav>
      </Container>

      {/* Rendered only when open rather than hidden with CSS, so its links stay
          out of the tab order and out of the accessibility tree when closed. */}
      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="border-t border-fg/10 bg-bg/95 backdrop-blur-md content:hidden"
        >
          <Container className="flex flex-col px-6 py-2">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-fg/8 py-4 font-ui text-xs tracking-[0.12em] text-fg/85 transition-colors last:border-b-0 hover:text-fg"
              >
                {link.label}
              </a>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}
