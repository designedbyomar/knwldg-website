import type { ComponentType } from "react";
import {
  CalendarCheck,
  ContactRound,
  Globe,
  Mail,
  MessageSquareText,
  Phone,
} from "lucide-react";
import { InstagramMark } from "@/components/ui/instagram-mark";
import { CONTACT } from "./contact";

/**
 * Copy and rows for the /links hub - the page a QR code at an event points at.
 *
 * It is the only surface that uses CONTACT.bookingEmail rather than the general
 * hello@ address: someone scanning a code at a wedding is asking about a date,
 * not saying hello.
 */

/**
 * Both Lucide icons and the inlined Instagram mark satisfy this, so a row can
 * carry either. Components rather than string names, for the same reason
 * data/events.ts does it: a bad icon fails to compile instead of rendering
 * nothing at runtime.
 */
type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

export type LinkRow = {
  label: string;
  /** Muted value on the right of the row. Omitted where the label says it all. */
  value?: string;
  href: string;
  icon: IconComponent;
  /** Filename for a download link; absent means a normal navigation. */
  download?: string;
  /** Opens in a new tab, with the usual rel hardening. */
  external?: boolean;
};

export const LINK_HUB = {
  tagline: "Open-Format DJ · Connecticut · NYC Metro · Northeast",
  services:
    "Weddings, corporate events, festivals, private events, and nightlife.",
  primary: {
    label: "Book KNWLDG",
    href: "/#booking",
    icon: CalendarCheck as IconComponent,
  },
} as const;

export const LINK_ROWS: LinkRow[] = [
  {
    label: "Text",
    value: CONTACT.phoneDisplay,
    href: `sms:${CONTACT.phoneE164}`,
    icon: MessageSquareText,
  },
  {
    label: "Call",
    value: CONTACT.phoneDisplay,
    href: `tel:${CONTACT.phoneE164}`,
    icon: Phone,
  },
  {
    label: "Email",
    value: CONTACT.bookingEmail,
    href: `mailto:${CONTACT.bookingEmail}`,
    icon: Mail,
  },
  {
    label: "Instagram",
    value: `@${CONTACT.instagramHandle}`,
    href: CONTACT.instagramUrl,
    icon: InstagramMark,
    external: true,
  },
  {
    label: "Save Contact",
    href: CONTACT.vCardPath,
    icon: ContactRound,
    download: CONTACT.vCardFilename,
  },
  {
    label: "Full Site",
    value: "djknwldg.com",
    href: CONTACT.website,
    icon: Globe,
  },
];
