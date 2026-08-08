import { GENRES } from "@/data/genres";
import { Chip } from "@/components/ui/chip";
import { Reveal } from "@/components/ui/reveal";

export function GenrePanel() {
  return (
    <section id="genres" className="brand-gradient px-5 py-14 content:px-14 content:py-20">
      <Reveal className="grid grid-cols-1 items-center gap-8 content:grid-cols-[280px_1fr] content:gap-12">
        <h2 className="font-display text-[32px] uppercase text-ink">
          Open format. Built around your crowd.
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {GENRES.map((genre) => (
            <Chip key={genre} variant="outline-dark">
              {genre}
            </Chip>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
