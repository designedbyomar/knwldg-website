import Image from "next/image";

export function Footer() {
  return (
    <footer className="flex flex-col gap-6 bg-bg-footer px-6 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-14">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
        <Image
          src="/brand/knwldg-mark-gradient.svg"
          alt="KNWLDG"
          width={96}
          height={48}
          className="h-auto w-24"
        />
        <div className="font-ui text-xs text-fg/50">
          Connecticut &middot; NYC Metro &middot; Western Massachusetts &middot; Northeast
        </div>
      </div>
      <div className="flex gap-5 font-ui text-xs tracking-[0.04em] text-fg/50">
        <a href="https://instagram.com" className="transition-colors hover:text-fg">
          INSTAGRAM
        </a>
        <a href="mailto:hello@djknwldg.com" className="transition-colors hover:text-fg">
          EMAIL
        </a>
        <span className="text-fg/85">djknwldg.com</span>
      </div>
    </footer>
  );
}
