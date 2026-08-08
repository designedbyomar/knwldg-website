import type { Metadata } from "next";
import { Anton, Sora, Work_Sans } from "next/font/google";
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

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${anton.variable} ${sora.variable} ${workSans.variable} antialiased`}
    >
      <body className="bg-bg text-fg font-body">{children}</body>
    </html>
  );
}
