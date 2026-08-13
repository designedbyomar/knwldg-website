import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { buildMedia } from "../scripts/build-media.mjs";

const sourceNames = [
  "Untitled.mov",
  "2.mp4",
  "showcase.m4v",
  "40763_667689627583_11200957_35243909_3224304_n.jpg",
  "746647511.383508.jpg",
];

const temporaryRoots = [];

function fixture({ missing } = {}) {
  const root = mkdtempSync(join(tmpdir(), "knwldg-media-test-"));
  temporaryRoots.push(root);
  const srcDir = join(root, "masters");
  const outDir = join(root, "media");
  mkdirSync(srcDir);
  mkdirSync(outDir);
  writeFileSync(join(outDir, "known-good.txt"), "keep me");

  for (const name of sourceNames) {
    if (name !== missing) writeFileSync(join(srcDir, name), "master");
  }

  return { root, srcDir, outDir };
}

function fakeTranscode(args) {
  writeFileSync(args.at(-1), "generated");
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("transactional media generation", () => {
  it("retains known-good output when a master is missing", () => {
    const { srcDir, outDir } = fixture({ missing: "showcase.m4v" });

    expect(() =>
      buildMedia({ srcDir, outDir, execute: fakeTranscode, log: () => {} })
    ).toThrow();
    expect(readFileSync(join(outDir, "known-good.txt"), "utf8")).toBe("keep me");
  });

  it("retains known-good output and cleans staging after a partial failure", () => {
    const { root, srcDir, outDir } = fixture();
    let calls = 0;

    expect(() =>
      buildMedia({
        srcDir,
        outDir,
        execute(args) {
          calls += 1;
          if (calls === 2) throw new Error("transcode failed");
          fakeTranscode(args);
        },
        log: () => {},
      })
    ).toThrow("transcode failed");

    expect(readFileSync(join(outDir, "known-good.txt"), "utf8")).toBe("keep me");
    expect(readdirSync(root).some((name) => name.startsWith(".media-build-"))).toBe(false);
  });

  it("replaces old output only after every generated file succeeds", () => {
    const { root, srcDir, outDir } = fixture();

    buildMedia({ srcDir, outDir, execute: fakeTranscode, log: () => {} });

    expect(existsSync(join(outDir, "known-good.txt"))).toBe(false);
    expect(readdirSync(outDir).sort()).toEqual([
      "archival-booth.jpg",
      "booth-performance.jpg",
      "booth-performance.mp4",
      "branded-event.jpg",
      "club-set.jpg",
      "club-set.mp4",
      "deck-closeup.jpg",
      "deck-closeup.mp4",
    ]);
    expect(readdirSync(root).some((name) => basename(name).startsWith(".media-build-"))).toBe(false);
  });
});
