export type Stat = {
  value: string;
  label: string;
  gradient?: boolean;
};

export const STATS: Stat[] = [
  { value: "15+", label: "YEARS BEHIND THE DECKS" },
  { value: "600+", label: "EVENTS PLAYED" },
  { value: "4", label: "STATES SERVED" },
  { value: "24h", label: "TYPICAL REPLY TIME", gradient: true },
];
