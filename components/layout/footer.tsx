import Image from "next/image";
import { ContactRound, Mail, MessageSquareText, Phone } from "lucide-react";
import { Container } from "@/components/layout/container";
import { CONTACT } from "@/data/contact";
import { ICON_SIZE, ICON_STROKE } from "@/data/icon-tokens";

const CONTACT_LINK =
  "inline-flex min-h-11 items-center gap-2 whitespace-nowrap px-2 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-fg transition-colors hover:text-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magenta";

export function Footer() {
  return (
    <footer className="bg-bg-footer">
      <Container className="flex flex-col items-center gap-5 px-6 py-8 sm:px-14 content:flex-row content:justify-between content:gap-8">
        <Image
          src="/brand/knwldg-mark-gradient.svg"
          alt="KNWLDG"
          width={96}
          height={48}
          className="h-auto w-24 shrink-0"
        />

        <nav
          aria-label="Contact KNWLDG"
          className="flex flex-wrap items-center justify-center gap-x-4 sm:flex-nowrap sm:gap-x-6 content:justify-end"
        >
          <a href={`sms:${CONTACT.phoneE164}`} className={CONTACT_LINK}>
            <MessageSquareText
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              className="text-violet"
              aria-hidden
            />
            Text
          </a>
          <a href={`tel:${CONTACT.phoneE164}`} className={CONTACT_LINK}>
            <Phone
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              className="text-violet"
              aria-hidden
            />
            Call
          </a>
          <a href={`mailto:${CONTACT.email}`} className={CONTACT_LINK}>
            <Mail
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              className="text-violet"
              aria-hidden
            />
            Email
          </a>
          <a
            href={CONTACT.vCardPath}
            download={CONTACT.vCardFilename}
            className={CONTACT_LINK}
          >
            <ContactRound
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              className="text-violet"
              aria-hidden
            />
            Save Contact
          </a>
        </nav>
      </Container>
    </footer>
  );
}
