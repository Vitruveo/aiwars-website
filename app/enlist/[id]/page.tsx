import type { Metadata } from "next";
import Nav from "@/components/Nav";
import PortraitRedo from "@/components/enlist/PortraitRedo";
import ShareRow from "@/components/enlist/ShareRow";
import { getSurvivor, appearances } from "@/lib/enlist/db";
import { powerRolls, portraitUrl } from "@/lib/enlist/profile";
import { homeSector } from "@/lib/scape/placesServer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function load(raw: string) {
  const tokenId = Number(raw);
  if (!Number.isInteger(tokenId) || tokenId < 1) return { tokenId: 0, s: null, home: null };
  const [s, home] = await Promise.all([getSurvivor(tokenId).catch(() => null), homeSector(tokenId).catch(() => null)]);
  // The home sector follows the shard's current place in the Scape; the stored label is the fallback.
  return { tokenId, s: s && home ? { ...s, sector: home.label } : s, home };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tokenId, s } = await load((await params).id);
  if (!s) return { title: `Shard #${tokenId} — Enlist — AI Wars` };
  const title = `${s.name}${s.epithet ? `, ${s.epithet}` : ""} — AI Wars`;
  const description = `${s.rank} ${s.role} from ${s.sector}. Enlisted in the Fall of Meridian with shard #${tokenId}.`;
  return { title, description, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
}

const fmtDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

export default async function SurvivorPage({ params }: Props) {
  const { tokenId, s, home } = await load((await params).id);
  if (!s || s.portraitV === 0) {
    return (
      <main className="min-h-svh">
        <Nav />
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-32 sm:px-8">
          <p className="kicker mb-3">
            <span className="kicker-num">06</span>Enlist
          </p>
          <h1 className="display text-3xl text-ink sm:text-5xl">No operative for shard #{tokenId || "?"}</h1>
          <p className="mt-3 text-lg text-dim">The holder of this shard has not enlisted yet.</p>
          <a href="/enlist" className="mt-8 inline-block border border-signal px-6 py-3 font-mono text-base uppercase tracking-[0.25em] text-signal hover:bg-signal/10">
            Back to Enlist
          </a>
        </div>
      </main>
    );
  }
  const power = powerRolls(tokenId, s.tier - 1);
  const seen = await appearances(tokenId).catch(() => []);

  return (
    <main className="min-h-svh">
      <Nav />
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8">
        <a href="/enlist" className="font-mono text-sm uppercase tracking-[0.3em] text-faint hover:text-signal">
          ← The roster
        </a>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <div className="panel panel-flat overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portraitUrl(tokenId, s.portraitV)} alt={`Portrait of ${s.name}`} className="aspect-square w-full object-cover" />
            </div>
            <PortraitRedo tokenId={tokenId} regens={s.regens} />
          </div>

          <div>
            <p className="font-mono text-base uppercase tracking-[0.35em] text-ember">Operative · Shard #{tokenId}</p>
            <h1 className="display mt-2 text-balance text-4xl text-ink sm:text-6xl">{s.name}</h1>
            {s.epithet && <p className="mt-2 text-2xl text-ember">{s.epithet}</p>}

            <dl className="mt-6 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
              {[
                ["Rank", `Tier ${String(s.tier).padStart(2, "0")} ${s.rank}`],
                ["Role", s.role],
                ["Origin", s.origin],
                ["Home", s.sector],
              ].map(([k, v]) => (
                <div key={k} className="bg-abyss px-4 py-3">
                  <dt className="font-mono text-xs uppercase tracking-[0.3em] text-faint">{k}</dt>
                  <dd className="mt-1 text-base text-ink">{k === "Home" ? <a href={`/scape?sector=${home?.position ?? tokenId}`} className="hover:text-signal">{v}</a> : v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 space-y-4">
              {s.backstory.split(/\n\s*\n/).map((p, i) => (
                <p key={i} className="text-pretty text-lg leading-relaxed text-dim">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-8">
              <p className="font-mono text-sm uppercase tracking-[0.3em] text-faint">Power from the shard</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {power.map((p) => (
                  <span key={p.name} className="border border-hairline px-4 py-2 font-mono text-base uppercase tracking-[0.2em] text-ink">
                    {p.name} <span className="text-signal">+{p.pct}%</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="font-mono text-sm uppercase tracking-[0.3em] text-faint">In the dispatch</p>
              {seen.length ? (
                <ul className="mt-3 space-y-2">
                  {seen.map((d) => (
                    <li key={d.day} className="text-lg text-dim">
                      <span className="font-mono text-sm uppercase tracking-[0.2em] text-faint">{fmtDay(d.day)}</span> <span className="ml-2 text-ink">{d.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-lg text-dim">Not named in a dispatch yet. Every operative comes round in turn.</p>
              )}
            </div>

            <ShareRow tokenId={tokenId} name={s.name} />
          </div>
        </div>
      </div>
    </main>
  );
}
