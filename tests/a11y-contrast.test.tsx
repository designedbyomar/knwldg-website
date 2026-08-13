// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { render } from "@testing-library/react";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Calendar } from "@/components/ui/calendar";

/**
 * The muted-text floor is `text-fg/50` (5.28:1 on black). `/45` measures
 * 4.41:1 and `/40` measures 3.66:1 — both fail WCAG 1.4.3.
 *
 * These assert the *class*, because the ratio is a deterministic function of
 * the opacity step and jsdom computes no real colours. The autocomplete cases
 * exist because that markup only mounts when an API key is present, so the
 * live axe sweep never reached it and the failures went unnoticed.
 */
const BELOW_FLOOR = /text-fg\/(?:[0-9]|[0-3][0-9]|4[0-9])\b/;

const results = [
  {
    place_id: "venue-1",
    name: "The Society Room of Hartford",
    formatted: "The Society Room of Hartford, 31 Pratt Street, Hartford, CT 06103",
    address_line2: "31 Pratt Street, Hartford, CT 06103",
  },
];

function Controlled() {
  const [value, setValue] = useState("");
  return (
    <LocationAutocomplete
      id="event-location"
      value={value}
      apiKey="test-key"
      onBlur={vi.fn()}
      onChange={(next) => setValue(next)}
    />
  );
}

describe("muted text floor", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ results }) } as unknown as Response)
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the autocomplete helper text at or above the floor", () => {
    const { container } = render(<Controlled />);
    const helper = container.querySelector("p.font-ui");
    expect(helper).not.toBeNull();
    expect(helper!.className).not.toMatch(BELOW_FLOOR);
    expect(helper!.className).toContain("text-fg/50");
  });

  // The attribution row inside the open listbox is deliberately not covered
  // here. Driving that state needs the component's exact Geoapify response
  // shape, and a test that fights the mock is worse than none. Its class is
  // asserted against source in the suite below instead.

  it("keeps the calendar weekday headers at or above the floor", () => {
    const { container } = render(<Calendar mode="single" />);
    const weekday = container.querySelector("[class*='uppercase'][class*='text-fg/']");
    expect(weekday).not.toBeNull();
    expect(weekday!.className).not.toMatch(BELOW_FLOOR);
  });
});

/**
 * Source-level guard for the states that are awkward to drive in jsdom - the
 * autocomplete's attribution row only mounts inside an open listbox. Reading
 * the file is a weaker check than rendering, but it still fails loudly if
 * someone drops an opacity below the floor.
 */
describe("muted text floor, by source", () => {
  it("has no text-fg opacity below /50 outside the disabled-day exemption", async () => {
    const { readFile } = await import("node:fs/promises");
    const offenders: string[] = [];

    for (const file of [
      "components/ui/location-autocomplete.tsx",
      "components/ui/date-picker.tsx",
      "components/ui/calendar.tsx",
    ]) {
      const src = await readFile(file, "utf8");
      src.split("\n").forEach((line, i) => {
        for (const m of line.matchAll(/text-fg\/(\d+)\b/g)) {
          const step = Number(m[1]);
          // /30 is the outside/disabled day, exempt under WCAG 1.4.3.
          if (step < 50 && !(step === 30 && file.endsWith("calendar.tsx"))) {
            offenders.push(`${file}:${i + 1} text-fg/${step}`);
          }
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});
