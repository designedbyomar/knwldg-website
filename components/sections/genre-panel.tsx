import { GENRES } from "@/data/genres";
import { Chip } from "@/components/ui/chip";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/layout/container";

export function GenrePanel() {
  return (
    <section id="genres" className="bg-bg px-4 py-8 content:px-12 content:py-12">
      <div className="brand-gradient-diagonal mx-auto max-w-page overflow-hidden">
        <Container className="px-5 py-20 content:px-14 content:py-28">
          <Reveal className="grid grid-cols-1 items-center gap-8 content:grid-cols-[280px_1fr] content:gap-12">
            <h2 className="font-display text-[32px] uppercase text-ink">
              Open format. Built around your crowd.
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {GENRES.map((genre) => (
                <Chip key={genre} variant="static-light">
                  {genre}
                </Chip>
              ))}
            </div>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
