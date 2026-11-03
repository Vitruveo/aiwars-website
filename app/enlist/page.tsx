import type { Metadata } from "next";
import Nav from "@/components/Nav";
import EnlistApp from "@/components/enlist/EnlistApp";

export const metadata: Metadata = {
  title: "Enlist — AI Wars",
  description: "Every shard enlists one survivor in the Fall of Meridian: a name, a role, a portrait and a story, named in the daily field dispatch.",
};

export default function EnlistPage() {
  return (
    <main className="min-h-svh">
      <Nav />
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8">
        <p className="kicker mb-3">
          <span className="kicker-num">06</span>Enlist
        </p>
        <h1 className="display text-balance text-3xl text-ink sm:text-5xl">Your survivor in the Fall of Meridian</h1>
        <p className="mt-3 max-w-3xl text-pretty text-lg text-dim">
          Every shard enlists one survivor. The Archive writes their story and paints their portrait, the daily dispatch puts them in the war, and they come with you when the game ships.
        </p>
        <div className="mt-10">
          <EnlistApp />
        </div>
      </div>
    </main>
  );
}
