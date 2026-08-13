import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/layout/footer";
import { Reveal } from "@/components/ui/reveal";

describe("UI regressions", () => {
  it("keeps the reveal content visible to non-JS HTML clients", () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <p>Visible content</p>
      </Reveal>
    );

    expect(html).not.toContain("opacity:0");
    expect(html).toContain("Visible content");
  });

  it("offers unified native contact actions without legacy footer content", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain('href="sms:+18604692202"');
    expect(html).toContain('href="tel:+18604692202"');
    expect(html).toContain('href="mailto:hello@djknwldg.com"');
    expect(html).toContain('href="/knwldg-omar-tavarez.vcf"');
    expect(html).toContain('download="KNWLDG-Omar-Tavarez.vcf"');
    expect(html).not.toContain("instagram.com");
    expect(html).not.toContain("Connecticut");
    expect(html).not.toContain("NYC Metro");
  });

  it("keeps every contact icon Violet", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain('class="lucide lucide-message-square-text text-violet"');
    expect(html).toContain('class="lucide lucide-phone text-violet"');
    expect(html).toContain('class="lucide lucide-mail text-violet"');
    expect(html).toContain('class="lucide lucide-contact-round text-violet"');
  });

  it("moves the complete contact group at the content breakpoint", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("content:flex-row");
    expect(html).toContain("sm:flex-nowrap");
    expect(html).toContain("whitespace-nowrap");
  });

  it("ships a portable KNWLDG contact card", () => {
    const card = readFileSync(
      new URL("../public/knwldg-omar-tavarez.vcf", import.meta.url),
      "utf8"
    );

    expect(card).toContain("\r\n");
    expect(card.replaceAll("\r\n", "")).not.toContain("\n");
    expect(card.endsWith("\r\n")).toBe(true);
    expect(card).toContain("FN:KNWLDG (Omar Tavarez)");
    expect(card).toContain("TEL;TYPE=CELL:+18604692202");
    expect(card).toContain("EMAIL;TYPE=INTERNET:hello@djknwldg.com");
    expect(card).toContain("URL:https://djknwldg.com");
  });
});
