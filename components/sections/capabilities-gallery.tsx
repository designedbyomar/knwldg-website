import { CAPABILITIES } from "@/data/capabilities";
import { Chip } from "@/components/ui/chip";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/layout/container";
import { MediaStrip } from "./media-strip";

export function CapabilitiesGallery() {
  return (
    <section className="border-b border-fg/10">
      <Container className="px-5 py-20 content:px-14 content:py-28">
        <Reveal className="mb-10 grid grid-cols-1 gap-8 content:grid-cols-[280px_1fr] content:gap-12">
          <h2 className="font-display text-[32px] uppercase text-fg">
            More than just a playlist.
          </h2>
          <div>
            <p className="mb-5 max-w-[520px] font-body text-[15px] leading-relaxed text-fg/65">
              KNWLDG brings 15+ years of experience, open-format mixing, crowd reading,
              professional sound, lighting, and event preparation.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {CAPABILITIES.map((capability) => (
                <Chip key={capability}>{capability}</Chip>
              ))}
            </div>
          </div>
        </Reveal>

        {/* The strip is a client leaf; this section stays server-rendered. */}
        <Reveal>
          <MediaStrip />
        </Reveal>
      </Container>
    </section>
  );
}
