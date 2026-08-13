import type { Metadata } from "next";
import { Anton, Sora } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KNWLDG — Open-Format DJ | CT, NYC Metro, Northeast",
  description:
    "KNWLDG is an open-format DJ serving Connecticut, the NYC metro, western Massachusetts, and the wider Northeast. Weddings, corporate events, festivals, private events, and nightlife.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${sora.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-fg font-body">
        {/* First focusable element on every route, so keyboard users can pass
            the eleven stops between the logo and the booking form. Hidden
            until focused; the outline treatment matches the secondary button
            so it reads as part of the system. Sits above the nav's z-50. */}
        <a
          href="#main-content"
          className="sr-only rounded-none focus:not-sr-only focus:fixed focus:top-4 focus:left-6 focus:z-60 focus:border focus:border-fg/30 focus:bg-bg focus:px-6 focus:py-3 focus:font-ui focus:text-xs focus:tracking-[0.08em] focus:text-fg focus:uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-violet"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
