import { describe, expect, it } from "vitest";

import {
  resolveActive,
  selectMostVisibleTile,
  videoToPlay,
} from "@/components/sections/media-strip";

/**
 * GALLERY alternates video and still, so indices 0/2/4 are videos and 1/3 are
 * images. These tests lean on that shape.
 */
describe("coarse-pointer tile selection", () => {
  it("returns no active tile when every one is below the visibility threshold", () => {
    expect(selectMostVisibleTile({ 0: 0.6, 2: 0.2, 4: 0 })).toBeNull();
  });

  it("selects the most visible tile", () => {
    expect(selectMostVisibleTile({ 0: 0.7, 2: 0.85, 4: 0.65 })).toBe(2);
  });

  // The regression this file exists for. An image used to be skipped here, so a
  // centred photograph stayed in the duotone forever on touch, where there is no
  // hover to fall back on.
  it("lets an image win the colour reveal over a less visible video", () => {
    expect(selectMostVisibleTile({ 0: 0.7, 1: 1, 2: 0.85, 4: 0.65 })).toBe(1);
  });

  // Ties are the case that pinned one tile lit permanently: with every tile
  // equally visible a strict `>` never displaces the incumbent, so index 0 won
  // and never yielded. Distance from the viewport centre is what breaks it.
  it("breaks a tie on distance from the viewport centre, not index order", () => {
    const allVisible = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1 };
    const distances = { 0: 400, 1: 200, 2: 10, 3: 200, 4: 400 };
    expect(selectMostVisibleTile(allVisible, distances)).toBe(2);
  });

  it("still prefers the more visible tile even when a tie-break is available", () => {
    const ratios = { 0: 1, 2: 0.7 };
    const distances = { 0: 500, 2: 0 };
    expect(selectMostVisibleTile(ratios, distances)).toBe(0);
  });

  it("falls back to the first qualifying tile when no distances are supplied", () => {
    expect(selectMostVisibleTile({ 0: 1, 1: 1, 2: 1 })).toBe(0);
  });
});

describe("resolving the active tile from both inputs", () => {
  // Centred tile 2, with tile 1 partly visible beside it.
  const ratios = { 1: 0.7, 2: 1 };
  const distances = { 1: 300, 2: 20 };

  it("gives a pointed tile precedence over the scroll selection", () => {
    expect(resolveActive(1, true, ratios, distances)).toBe(1);
  });

  // The regression: releasing a hover changes no intersection ratio, so the
  // observer never speaks again. Returning null here left the centred tile in
  // the duotone with its video paused until the next threshold crossing.
  it("falls back to the most-visible tile when a hover or focus ends", () => {
    expect(resolveActive(null, true, ratios, distances)).toBe(2);
  });

  it("clears the active tile on exit where the strip does not scroll", () => {
    expect(resolveActive(null, false, ratios, distances)).toBeNull();
  });

  it("clears the active tile on exit when nothing is sufficiently visible", () => {
    expect(resolveActive(null, true, { 1: 0.2 }, { 1: 40 })).toBeNull();
  });

  it("keeps a pointed tile even when the observer has reported nothing", () => {
    expect(resolveActive(3, true, {}, {})).toBe(3);
  });
});

describe("playback selection", () => {
  it("plays a video tile that is active", () => {
    expect(videoToPlay(2, false)).toBe(2);
  });

  it("plays nothing while an image is the active tile", () => {
    expect(videoToPlay(1, false)).toBeNull();
  });

  it("plays nothing when no tile is active", () => {
    expect(videoToPlay(null, false)).toBeNull();
  });

  it("never autoplays under reduced motion, even on a video tile", () => {
    expect(videoToPlay(2, true)).toBeNull();
  });
});
