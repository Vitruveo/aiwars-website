import type { Metadata } from "next";
import { Orbitron, Inter, Share_Tech_Mono, Gugi } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import Web3Providers from "@/components/Web3Providers";

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

const logoFont = Gugi({
  subsets: ["latin"],
  variable: "--font-logo",
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
    "A persistent science-fiction universe about agency, intelligence, memory and war. Archive Shard public mint — 5,000 NFTs, five tiers, four activations. A Vertical Foundation project.",
  openGraph: {
    title: "AI Wars — The Fall of Meridian",
    description:
      "Humanity's greatest city. Its most dangerous secret. Archive Shard public mint — a Vertical Foundation project.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Wars — The Fall of Meridian",
    description:
      "Humanity's greatest city. Its most dangerous secret. Archive Shard public mint — a Vertical Foundation project.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${logoFont.variable}`}>
      <body className="grain">
        <Web3Providers>{children}</Web3Providers>
        <Analytics />
      </body>
    </html>
  );
}
