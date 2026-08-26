import { renderToStaticMarkup } from "react-dom/server";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import QRCode, { type QRCodeToStringOptions } from "qrcode";
import { describe, expect, it } from "vitest";

import { LinkHub } from "@/components/sections/link-hub";
import { CONTACT } from "@/data/contact";
import {
  MANIFEST_NAME,
  QR_OPTIONS,
  readLinksUrl,
} from "../scripts/generate-qr.mjs";

/**
 * The link hub is the one page reached from a printed QR code, so a broken
 * href here is not a bad link - it is a bad link on someone's business card.
 */
describe("link hub", () => {
  const html = renderToStaticMarkup(<LinkHub />);

  it("offers every contact action as a native handler", () => {
    expect(html).toContain('href="/#booking"');
    expect(html).toContain('href="sms:+18604692202"');
    expect(html).toContain('href="tel:+18604692202"');
    expect(html).toContain('href="mailto:bookings@djknwldg.com"');
    expect(html).toContain('href="https://instagram.com/djknwldg"');
    expect(html).toContain('href="/knwldg-omar-tavarez.vcf"');
    expect(html).toContain('download="KNWLDG-Omar-Tavarez.vcf"');
    expect(html).toContain('href="https://djknwldg.com"');
  });

  it("routes inquiries to the booking inbox, not the general address", () => {
    expect(html).toContain(CONTACT.bookingEmail);
    expect(html).not.toContain(CONTACT.email);
  });

  it("hardens the one link that leaves the site", () => {
    expect(html).toMatch(
      /href="https:\/\/instagram\.com\/djknwldg"[^>]*rel="noopener noreferrer"/,
    );
  });

  /**
   * The muted-text floor from tests/a11y-contrast.tsx: `text-fg/50` is 5.28:1
   * on black, and `/45` already fails WCAG 1.4.3.
   */
  it("keeps every label at or above the muted-text floor", () => {
    expect(html).not.toMatch(/text-fg\/(?:[0-9]|[0-3][0-9]|4[0-9])\b/);
  });

  it("ships no client component, so the page hydrates nothing", () => {
    const source = readFileSync(
      new URL("../components/sections/link-hub.tsx", import.meta.url),
      "utf8",
    );

    expect(source).not.toContain("use client");
    expect(source).not.toContain("motion/react");
  });
});

/**
 * A printed code cannot be re-issued, so these guard the one failure that has
 * no fix: assets that no longer point where the page lives.
 */
describe("printed QR code", () => {
  it("encodes the URL the site itself publishes", () => {
    expect(readLinksUrl()).toBe(CONTACT.linksUrl);
    expect(CONTACT.linksUrl).toBe(`${CONTACT.website}/links`);
  });

  it("keeps the committed artwork in sync with that URL", async () => {
    const committed = readFileSync(
      new URL("../public/qr/knwldg-links-qr.svg", import.meta.url),
      "utf8",
    );

    const regenerated = await QRCode.toString(CONTACT.linksUrl, {
      ...(QR_OPTIONS as QRCodeToStringOptions),
      type: "svg",
    });

    expect(committed).toBe(regenerated);
  });

  /**
   * The card is a Chrome screenshot, so it cannot be checked the way the SVG
   * above is - Chrome does not render byte-identically across versions. The
   * manifest is written only after all three files are produced in one run, so
   * matching digests are what prove the committed card belongs to the
   * committed URL rather than to whatever the URL used to be.
   */
  it("ties every committed artefact to that same URL", () => {
    const manifest = JSON.parse(
      readFileSync(
        new URL(`../public/qr/${MANIFEST_NAME}`, import.meta.url),
        "utf8",
      ),
    ) as { url: string; files: Record<string, string> };

    expect(manifest.url).toBe(CONTACT.linksUrl);
    expect(Object.keys(manifest.files).sort()).toEqual([
      "knwldg-links-card.png",
      "knwldg-links-qr.png",
      "knwldg-links-qr.svg",
    ]);

    for (const [name, recorded] of Object.entries(manifest.files)) {
      const file = new URL(`../public/qr/${name}`, import.meta.url);
      expect(existsSync(file), `${name} is missing - re-run npm run qr`).toBe(
        true,
      );
      expect(
        createHash("sha256").update(readFileSync(file)).digest("hex"),
        name,
      ).toBe(recorded);
    }
  });
});
