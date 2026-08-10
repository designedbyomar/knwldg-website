export const BUSINESS_TIME_ZONE = "America/New_York";

const businessDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Returns the business-local calendar date without depending on the host timezone. */
export function getBusinessTodayIso(now = new Date()): string {
  const parts = businessDateFormatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine the business date");
  }

  return `${year}-${month}-${day}`;
}
