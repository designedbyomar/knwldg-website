import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LaserFallback } from "@/components/three/laser-fallback";
import { LaserHeroSceneLoader } from "@/components/three/laser-hero-scene-loader";
import { Container } from "@/components/layout/container";
import { HeroLightPool } from "./hero-light-pool";
import { HeroCastShadow } from "./hero-cast-shadow";
import { HeroParallax, MARK_PARALLAX_PX } from "./hero-parallax";
import { PORTRAIT_FADE_MASK, SCRIM_SETTLE_PX } from "./hero-fade";

const MARK_SRC = "/brand/knwldg-mark-gradient.svg";
const PHOTO_SRC = "/brand/knwldg-photo.png";

/**
 * Alpha-only, 720px wide, ~29KB. A CSS mask-image url() bypasses next/image
 * entirely, so pointing it at PHOTO_SRC pulled the unoptimised 1.9MB original
 * as a second download purely to be used as a stencil. The mask is stretched to
 * 100% 100% and the portrait renders at most 360 CSS px wide, so 2x is plenty.
 * Regenerate from the source PNG's alpha channel if the cutout ever changes.
 */
const PHOTO_MASK_SRC = "/brand/knwldg-photo-mask.png";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-bg px-6 pb-10 text-center [isolation:isolate] sm:px-8"
    >
      {/* Below the canvas, not above it. This used to sit at z-20 with
          mix-blend-screen, so every WebGL beam was viewed through a haze veil. */}
      <LaserFallback className="z-0" />

      {/* The spotlight itself is never drawn - this is only the light it casts.
          Sits *below* the beam canvas on purpose: light lands on the back wall,
          beams hang in the air in front of it. Kept dim: it is an ambient bed
          for the shadows to fall on, not the subject. The bright light is the
          masked pools on the mark and the portrait below. */}
      {/* A peak, not a constant: opacity is intensity * strength and intensity
          breathes 0.45..1.0 on the beat.
          Lower than the 0.42 this ran at under plus-lighter: hard-light
          saturates where the additive blend washed out, so the same number read
          as a much more present blue field behind the wordmark. */}
      <HeroLightPool className="z-[5]" strength={0.28} />

      {/* Second fixture, rose. Same clock, same breathing envelope, same strobe
          gate - only the path is mirrored, so the pair sweeps toward each other,
          crosses near the middle and separates.
          Backdrop only on purpose: it does not light the wordmark. Rose landing
          on the mark's own #ff81dd end would be the same-hue-on-same-hue problem
          that cost the logo its contrast two passes ago, just on the other half. */}
      <HeroLightPool className="z-[5]" strength={0.28} channel="counter" />

      <LaserHeroSceneLoader />

      {/* Gives the portrait real black to dissolve into. Without this its
          bottom fade lands on lit haze instead of on the page ground, which is
          what cancelled the fade-to-black.
          Starts at --hero-fade-start, the measured line where he begins going
          translucent - black has to be arriving already by the time you can see
          through him, or the beams behind show through his shirt. This layer,
          not the beam mask, is what lets the beam emitter sit low again. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[35]"
        style={{
          background: [
            "linear-gradient(to bottom,",
            "transparent var(--hero-fade-start, 358px),",
            `var(--color-bg) calc(var(--laser-cutoff, 519px) - ${SCRIM_SETTLE_PX}px),`,
            "var(--color-bg))",
          ].join(" "),
        }}
      />

      <Container>
        <div className="relative pt-20">
          {/* Positioning stays on these wrappers: HeroParallax animates via
              Motion's x/y, which writes `transform` and would otherwise clobber
              Tailwind's -translate-x-1/2 centering. */}
          <div
            aria-hidden
            className="absolute left-1/2 top-[8%] z-30 w-[min(820px,110%)] -translate-x-1/2 opacity-90"
          >
            <HeroParallax depth={MARK_PARALLAX_PX}>
              <div className="relative">
                {/* First child so it paints behind the mark inside this
                    wrapper's stacking context. */}
                <HeroCastShadow src={MARK_SRC} width={820} height={410} blurPx={26} opacity={0.5} />
                <Image
                  src={MARK_SRC}
                  alt=""
                  width={820}
                  height={410}
                  priority
                  className="h-auto w-full"
                />
                {/* Lights the lettering as the spot crosses it. Violet against
                    the mark's own blue-to-pink ramp, so it reads as light on
                    the logo rather than as more background. */}
                <HeroLightPool maskUrl={MARK_SRC} strength={0.55} />
              </div>
            </HeroParallax>
          </div>

          {/* No parallax here on purpose - the portrait stays planted and only
              the mark behind it drifts, which is what sells the depth. */}
          <div id="hero-portrait" className="relative z-40 mx-auto mt-4 w-[clamp(220px,60vw,360px)]">
            {/* Falls on the wordmark behind him, which is the only place a
                black silhouette has anything to register against. Carries the
                same bottom fade as the photo, or the blur spreads past where he
                has already dissolved and paints a soft dark rectangle. */}
            <HeroCastShadow src={PHOTO_SRC} width={1253} height={1474} fade />
            <Image
              src={PHOTO_SRC}
              alt="KNWLDG performing"
              width={1253}
              height={1474}
              priority
              // The bottom fade is a mask on the cutout itself. It used to be a
              // gradient div over the box, which painted a visible rectangle
              // wherever the lasers behind it were brighter than the fade.
              // Shared with the shadow above and the scrim, via hero-fade.ts.
              className="h-auto w-full"
              style={{ WebkitMaskImage: PORTRAIT_FADE_MASK, maskImage: PORTRAIT_FADE_MASK }}
            />
            {/* Clipped to both his alpha and that same bottom fade. The fade
                clip is the difference between this and the previous build,
                where an unfaded near-white pool relit the region that was
                supposed to be dissolving and blew out his lower half. */}
            <HeroLightPool maskUrl={PHOTO_MASK_SRC} maskFade strength={0.45} />
          </div>

          <div className="relative z-50 mx-auto mt-3 max-w-[760px] px-8">
            <h1 className="font-display text-[clamp(22px,6vw,26px)] uppercase tracking-[0.01em] text-fg">
              Sound. Energy. Atmosphere.
            </h1>
          </div>

          <div className="relative z-50 mt-2.5 text-center">
            <p className="mx-auto max-w-[700px] font-body text-[15px] leading-relaxed text-fg/60">
              Weddings, corporate events, festivals, nightlife, and private events
              <br className="hidden sm:block" /> across Connecticut, the NYC metro, western
              Massachusetts, and the Northeast.
            </p>

            <Button href="#booking" className="mt-6 px-[42px] py-[17px]">
              Check Availability
            </Button>

            <div className="mt-4.5 pb-8 font-ui text-xs tracking-[0.04em] text-fg/55">
              15+ YEARS&nbsp;&nbsp;&bull;&nbsp;&nbsp;OPEN FORMAT&nbsp;&nbsp;&bull;&nbsp;&nbsp;SOUND + LIGHTING
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
