import { EVENT_TYPES } from "@/data/events";
import { hueRampOklch } from "@/data/theme-tokens";
import { ICON_SIZE, ICON_STROKE } from "@/data/icon-tokens";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/layout/container";

export function EventsGrid() {
  return (
    <section id="events" className="border-b border-fg/10">
      <Container className="px-5 py-20 content:px-14 content:py-28">
        <Reveal className="mb-9 flex flex-col items-start justify-between gap-3 content:flex-row content:items-end">
          <h2 className="font-display text-[32px] uppercase leading-[0.95] text-fg content:text-[38px]">
            Built for your event
            <br />
            and your crowd.
          </h2>
          <div className="font-ui text-xs tracking-[0.06em] text-fg/50">
            FIVE ROOMS, ONE APPROACH
          </div>
        </Reveal>

        <div className="mb-7 grid grid-cols-1 gap-px bg-fg/12 content:grid-cols-5">
          {EVENT_TYPES.map((event, i) => (
            <Reveal
              key={event.index}
              delay={i * 0.06}
              className="bg-bg px-4.5 py-5.5 transition-colors duration-300 hover:bg-fg/5"
            >
              {/* Decorative: the title below already names the category, so a
                  label here would make screen readers announce it twice. The
                  ramp colour carried by the old 01-05 numeral moves onto the
                  icon so the Rose -> Ultraviolet progression survives. */}
              <event.icon
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                aria-hidden
                className="mb-3.5"
                style={{ color: hueRampOklch(event.hue) }}
              />
              <div className="font-body text-sm font-semibold text-fg/92">{event.title}</div>
              <div className="mt-1.5 font-body text-xs leading-[1.45] text-fg/55">
                {event.description}
              </div>
            </Reveal>
          ))}
        </div>

        <Button href="#booking" variant="outline" className="px-6.5 py-3 text-xs">
          Tell Me About Your Event
        </Button>
      </Container>
    </section>
  );
}
