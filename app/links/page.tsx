import type { Metadata } from "next";
import { LinkHub } from "@/components/sections/link-hub";
import { CONTACT } from "@/data/contact";

export const metadata: Metadata = {
  title: "KNWLDG — Links | Book, Text, Call, Instagram",
  description:
    "Every way to reach KNWLDG in one place: book a date, text, call, email, Instagram, and the contact card. Open-format DJ serving Connecticut, the NYC metro, and the Northeast.",
  alternates: { canonical: CONTACT.linksUrl },
};

/**
 * The destination of the printed QR code (see scripts/generate-qr.mjs).
 *
 * No Nav and no Footer on purpose: a link hub is the whole viewport, the nav's
 * #events and #genres anchors do not exist on this route, and the rows already
 * carry every contact action the footer offers.
 */
export default function LinksPage() {
  return (
    // tabIndex={-1} for the same reason as the homepage: the layout's skip link
    // targets #main-content on every route, and without it several browsers
    // scroll to the target but leave keyboard focus behind.
    <main id="main-content" tabIndex={-1} className="outline-none">
      <LinkHub />
    </main>
  );
}
