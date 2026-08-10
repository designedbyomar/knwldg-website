import { STATS } from "@/data/stats";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/layout/container";

export function StatsStrip() {
  return (
    <div className="border-b border-fg/10">
      <Container className="grid grid-cols-2 content:grid-cols-4 text-center">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 0.08}
            className={cn(
              "border-fg/10 px-6 py-6.5",
              i % 2 === 0 && "border-r",
              i < 2 && "border-b",
              "content:border-b-0",
              i < STATS.length - 1 ? "content:border-r" : "content:border-r-0"
            )}
          >
            <div
              className={cn(
                "font-display text-[34px] text-fg",
                stat.gradient && "text-rose"
              )}
            >
              {stat.value}
            </div>
            <div className="mt-1.5 font-ui text-[11px] tracking-[0.08em] text-fg/50">
              {stat.label}
            </div>
          </Reveal>
        ))}
      </Container>
    </div>
  );
}
