import { EVENT_TYPES } from "@/data/events";
import { hueRampOklch } from "@/data/theme-tokens";
import { Button } from "@/components/ui/button";

export function EventsGrid() {
  return (
    <section id="events" className="border-b border-fg/10 px-5 py-14 content:px-14 content:py-20">
      <div className="mb-9 flex flex-col items-start justify-between gap-3 content:flex-row content:items-end">
        <h2 className="font-display text-[32px] uppercase leading-[0.95] text-fg content:text-[38px]">
          Built for your event
          <br />
          and your crowd.
        </h2>
        <div className="font-ui text-xs tracking-[0.06em] text-fg/50">
          FIVE ROOMS, ONE APPROACH
        </div>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-px bg-fg/12 content:grid-cols-5">
        {EVENT_TYPES.map((event) => (
          <div key={event.index} className="bg-bg px-4.5 py-5.5">
            <div
              className="mb-3.5 font-display text-xs tracking-[0.1em]"
              style={{ color: hueRampOklch(event.hue) }}
            >
              {event.index}
            </div>
            <div className="font-body text-sm font-semibold text-fg/92">{event.title}</div>
            <div className="mt-1.5 font-body text-xs leading-[1.45] text-fg/55">
              {event.description}
            </div>
          </div>
        ))}
      </div>

      <Button href="#booking" variant="outline" className="px-6.5 py-3 text-xs">
        Tell Me About Your Event
      </Button>
    </section>
  );
}
