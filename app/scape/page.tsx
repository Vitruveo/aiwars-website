import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ScapeApp from "@/components/scape/ScapeApp";

export const metadata: Metadata = {
  title: "The Scape — AI Wars",
  description: "Fly any of the 5,000 sectors around the Archive. Hold a shard to light yours and name a place in it.",
};

export default function ScapePage() {
  return (
    <main className="min-h-svh">
      <Nav />
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-8">
        <p className="kicker mb-3">
          <span className="kicker-num">05</span>The Scape
        </p>
        <h1 className="display text-3xl text-ink sm:text-5xl">One sector per shard</h1>
        <p className="mt-3 text-lg text-dim">
          Five thousand sectors spiral out from the Archive. Each shard holds one. Fly it, name a place in it, and watch the map light up as the tiers sell.
        </p>
        <div className="mt-8">
          <ScapeApp />
        </div>
      </div>
    </main>
  );
}
