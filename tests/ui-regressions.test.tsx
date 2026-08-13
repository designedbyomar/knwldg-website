import { renderToStaticMarkup } from "react-dom/server";
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

  it("links the Instagram icon to the branded account, not the bare domain", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("https://www.instagram.com/djknwldg/");
    expect(html).not.toContain("https://instagram.com");
  });
});
