import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { label: "EVENTS", href: "#events" },
  { label: "MUSIC", href: "#genres" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-fg/10 bg-bg/85 px-6 py-6 backdrop-blur-md sm:px-14">
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
        <a href="#booking" className="text-magenta transition-colors hover:text-violet">
          BOOK
        </a>
      </nav>
    </header>
  );
}
