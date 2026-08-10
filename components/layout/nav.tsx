"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled && "border-b border-fg/10 bg-bg/85 backdrop-blur-md"
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
        <nav className="flex items-center gap-8 font-ui text-xs tracking-[0.12em] text-fg/85">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-fg">
              {link.label}
            </a>
          ))}
          <Button href="#booking" variant="gradient" className="px-4.5 py-2 text-xs">
            BOOK
          </Button>
        </nav>
      </Container>
    </header>
  );
}
