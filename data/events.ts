import { Building2, Disc3, Gem, PartyPopper, Tent, type LucideIcon } from "lucide-react";
import { EVENT_HUE_RAMP } from "./theme-tokens";

export type EventType = {
  /** Retained as the React key. No longer rendered - the icon replaced it. */
  index: string;
  hue: number;
  title: string;
  description: string;
  /**
   * Lucide component rather than a string name, so a bad icon fails to compile
   * instead of rendering nothing at runtime. See DESIGN.md > Iconography for
   * the size and stroke tokens these are drawn at.
   */
  icon: LucideIcon;
};

export const EVENT_TYPES: EventType[] = [
  {
    index: "01",
    hue: EVENT_HUE_RAMP[0],
    title: "Weddings",
    description: "From ceremony through the last dance.",
    icon: Gem,
  },
  {
    index: "02",
    hue: EVENT_HUE_RAMP[1],
    title: "Corporate",
    description: "Professional music, audio, and event support.",
    icon: Building2,
  },
  {
    index: "03",
    hue: EVENT_HUE_RAMP[2],
    title: "Festivals",
    description: "Music, announcements, and sound at scale.",
    icon: Tent,
  },
  {
    index: "04",
    hue: EVENT_HUE_RAMP[3],
    title: "Private",
    description: "Birthdays, graduations, celebrations.",
    icon: PartyPopper,
  },
  {
    index: "05",
    hue: EVENT_HUE_RAMP[4],
    title: "Nightlife",
    description: "Bars, lounges, clubs, and residencies.",
    icon: Disc3,
  },
];
