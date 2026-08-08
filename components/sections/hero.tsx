import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LaserFallback } from "@/components/three/laser-fallback";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-bg px-6 pb-10 text-center [isolation:isolate] sm:px-8"
    >
      <LaserFallback />

      <div className="relative pt-1.5">
        <div
          aria-hidden
          className="absolute left-1/2 top-[8%] z-0 w-[min(820px,110%)] -translate-x-1/2 opacity-90"
        >
          <Image
            src="/brand/knwldg-mark-gradient.svg"
            alt=""
            width={820}
            height={409}
            priority
            className="h-auto w-full"
          />
        </div>

        <div className="relative z-10 mx-auto mt-4 w-[clamp(220px,60vw,360px)]">
          <Image
            src="/brand/knwldg-photo.png"
            alt="KNWLDG performing"
            width={1253}
            height={1474}
            priority
            className="h-auto w-full drop-shadow-[0_24px_44px_oklch(0.05_0.02_300_/_0.7)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-b from-transparent to-bg"
          />
        </div>

        <div className="relative z-10 mx-auto mt-3 max-w-[640px] px-8">
          <h1 className="font-display text-[clamp(22px,6vw,26px)] uppercase tracking-[0.01em] text-fg">
            Sound. Energy. Atmosphere.
          </h1>
        </div>

        <div className="relative z-10 mt-2.5 text-center">
          <p className="mx-auto max-w-[480px] font-body text-[15px] leading-relaxed text-fg/60">
            Weddings, corporate events, festivals, nightlife, and private events across
            Connecticut, the NYC metro, western Massachusetts, and the Northeast.
          </p>

          <Button href="#booking" className="mt-6 px-[42px] py-[17px]">
            Check Availability
          </Button>

          <div className="mt-4.5 pb-8 font-ui text-xs tracking-[0.04em] text-fg/45">
            15+ YEARS&nbsp;&nbsp;&bull;&nbsp;&nbsp;OPEN FORMAT&nbsp;&nbsp;&bull;&nbsp;&nbsp;SOUND + LIGHTING
          </div>
        </div>
      </div>
    </section>
  );
}
