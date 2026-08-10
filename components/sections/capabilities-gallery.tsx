import { CAPABILITIES, GALLERY } from "@/data/capabilities";
import { Chip } from "@/components/ui/chip";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/layout/container";

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

        <div className="grid grid-cols-1 gap-px bg-fg/10 content:grid-cols-5">
          {GALLERY.map((item, i) => (
            <Reveal
              key={item.label}
              delay={i * 0.06}
              className="flex aspect-3/4 items-center justify-center p-4 text-center"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, var(--color-bg), var(--color-bg) 10px, rgb(255 255 255 / 0.06) 10px, rgb(255 255 255 / 0.06) 20px)",
              }}
            >
              <span className="font-ui text-[10px] uppercase tracking-[0.08em] text-fg/70">
                {item.label}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
