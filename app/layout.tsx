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
      <body className="bg-bg text-fg font-body">{children}</body>
    </html>
  );
}
