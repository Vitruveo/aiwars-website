import type { Metadata } from "next";
import MysteryTerminal from "@/components/MysteryTerminal";

// The mystery AI. A dark page, one line of input. Not linked from the nav.

export const metadata: Metadata = {
  title: "AI Wars",
  description: "",
  robots: { index: false, follow: false },
};

export default function MysteryPage() {
  return <MysteryTerminal />;
}
