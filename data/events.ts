import { EVENT_HUE_RAMP } from "./theme-tokens";

export type EventType = {
  index: string;
  hue: number;
  title: string;
  description: string;
};

export const EVENT_TYPES: EventType[] = [
  {
    index: "01",
    hue: EVENT_HUE_RAMP[0],
    title: "Weddings",
    description: "From ceremony through the last dance.",
  },
  {
    index: "02",
    hue: EVENT_HUE_RAMP[1],
    title: "Corporate",
    description: "Professional music, audio, and event support.",
  },
  {
    index: "03",
    hue: EVENT_HUE_RAMP[2],
    title: "Festivals",
    description: "Music, announcements, and sound at scale.",
  },
  {
    index: "04",
    hue: EVENT_HUE_RAMP[3],
    title: "Private",
    description: "Birthdays, graduations, celebrations.",
  },
  {
    index: "05",
    hue: EVENT_HUE_RAMP[4],
    title: "Nightlife",
    description: "Bars, lounges, clubs, and residencies.",
  },
];
