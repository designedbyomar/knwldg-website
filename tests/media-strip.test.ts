import { describe, expect, it } from "vitest";

import { selectMostVisibleVideo } from "@/components/sections/media-strip";

describe("coarse-pointer media selection", () => {
  it("returns no active video when every tile is below the visibility threshold", () => {
    expect(selectMostVisibleVideo({ 0: 0.6, 2: 0.2, 4: 0 })).toBeNull();
  });

  it("selects the most visible video and ignores image tile ratios", () => {
    expect(selectMostVisibleVideo({ 0: 0.7, 1: 1, 2: 0.85, 4: 0.65 })).toBe(2);
  });
});
