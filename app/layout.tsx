import type { Metadata } from "next";
import { Orbitron, Inter, Share_Tech_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700", "900"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: "AI Wars — The Fall of Meridian",
  description:
    "A persistent science-fiction universe about agency, intelligence, memory and war. $AIWARS public mint — every token auto-staked to one of 30 agents. A Vertical Foundation project.",
  openGraph: {
    title: "AI Wars — The Fall of Meridian",
    description:
      "Humanity's greatest city. Its most dangerous secret. $AIWARS public mint — a Vertical Foundation project.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Wars — The Fall of Meridian",
    description:
      "Humanity's greatest city. Its most dangerous secret. $AIWARS public mint — a Vertical Foundation project.",
    images: ["/og.jpg"],
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
