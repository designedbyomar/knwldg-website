export const CONTACT = {
  name: "KNWLDG (Omar Tavarez)",
  phoneDisplay: "860-469-2202",
  phoneE164: "+18604692202",
  email: "hello@djknwldg.com",
  /**
   * The address the link hub sends inquiries to. Deliberately separate from
   * `email`: the footer, the vCard and the booking route keep the general
   * hello@ address, and only /links routes straight to the booking inbox.
   */
  bookingEmail: "bookings@djknwldg.com",
  instagramHandle: "djknwldg",
  instagramUrl: "https://instagram.com/djknwldg",
  website: "https://djknwldg.com",
  /**
   * What the printed QR code encodes, so the page and the code can never drift
   * apart - scripts/generate-qr.mjs and the /links route read the same value.
   *
   * The apex, not www: the apex 308s to www today, and if the canonical host
   * ever flips the apex still resolves. A printed code cannot be re-issued.
   */
  linksUrl: "https://djknwldg.com/links",
  vCardPath: "/knwldg-omar-tavarez.vcf",
  vCardFilename: "KNWLDG-Omar-Tavarez.vcf",
} as const;
