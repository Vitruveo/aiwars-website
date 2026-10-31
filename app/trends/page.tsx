import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { GameApp } from "@/components/trends/game-app";
import { PreviewLiveBanner } from "@/components/trends/coming-soon";
import "@/components/trends/trends.css";

export const metadata: Metadata = {
  title: "AIWars Trends — AI Wars",
  description:
    "A live five-minute trend game on AI Wars Battle Momentum. Stake VTRU on one of five buckets: a hit returns your stake plus credits toward a Tier 5 Archive Shard, a miss is burned.",
};

// The game first, as on home and mint; then what it is, the leaderboard and the rulebook.
export default function Trends() {
  return (
    <main className="min-h-svh overflow-x-clip bg-abyss">
      <Nav />
      <div className="aw-page aw">
        <section className="aw-hero">
          <img src="/trends/war.jpg" alt="" aria-hidden="true" className="aw-hero-art" />
          <div className="aw-hero-tint" />
          <div className="aw-hero-fade" />
          <div className="aw-starfield" />
          <div className="aw-scanline" />
          <div className="container position-relative" style={{ maxWidth: "1100px", paddingTop: "110px", paddingBottom: "20px" }}>
            <p className="aw-kicker aw-kicker-ink mb-3">Shard activation &middot; The Fall of Meridian</p>
            <h1 className="aw-glitch mb-2" style={{ lineHeight: 1 }}>
              <span aria-label="AI WARS" role="img" className="aw-logo">
                A<span aria-hidden="true" className="aw-logo-i">I</span>WARS
              </span>{" "}
              <span className="aw-display aw-trends">Trends</span>
            </h1>
          </div>
        </section>

        <section className="aw-body-band" style={{ paddingBottom: "60px" }}>
          <div className="container" style={{ maxWidth: "1100px" }}>
            <GameApp
              about={
                <div className="row g-4 align-items-stretch mt-4">
                  <div className="col-lg-8 aw-intro-col">
                    <p className="aw-kicker aw-kicker-ember mb-0">Live trend game &nbsp;&middot;&nbsp; The Fall of Meridian</p>
                    <div className="aw-rule my-4" style={{ maxWidth: "560px" }} />
                    <p className="aw-ink mb-3" style={{ maxWidth: "760px", fontSize: "1.15rem" }}>
                      Prediction markets trade on real-world events. AIWars Trends moves that up a notch: the TrendPulse
                      oracle ingests live gaming telemetry from AI Wars and turns the battle itself into a tradable trend,
                      a market on the direction of the fight, not a who-wins bet.
                    </p>
                    <p className="aw-dim mb-0" style={{ maxWidth: "720px", fontSize: "1.05rem" }}>
                      A new 5-minute market opens on every 5-minute mark. Betting is open for the first four minutes, the
                      last minute is a locked runout. The dotted line is the live ordinary least squares trend of the
                      pulse so far; watch it switch buckets as the battle moves, then lock your own line in before the
                      gate closes.
                    </p>
                  </div>
                  <div className="col-lg-4 d-flex">
                    <PreviewLiveBanner />
                  </div>
                </div>
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
