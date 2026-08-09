import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AI Wars — The Fall of Meridian",
  description:
    "A persistent science-fiction universe about agency, intelligence, memory and war. $AIWARS public mint — every token auto-staked to one of 30 agents. A Vertical Foundation project.",
  openGraph: {
    title: "AI Wars — The Fall of Meridian",
    description:
      "Humanity's greatest city. Its most dangerous secret. $AIWARS public mint — a Vertical Foundation project.",
    images: ["/art/meridian.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="grain">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
