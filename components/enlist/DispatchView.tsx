import { portraitUrl, type Dispatch, type Survivor } from "@/lib/enlist/profile";

const fmtDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });

function Body({ text }: { text: string }) {
  return (
    <div className="mt-4 space-y-4">
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i} className="max-w-3xl text-pretty text-lg leading-relaxed text-dim">
          {p}
        </p>
      ))}
    </div>
  );
}

function Featured({ ids, byId }: { ids: number[]; byId: Map<number, Survivor> }) {
  const cast = ids.map((id) => byId.get(id)).filter((s): s is Survivor => Boolean(s));
  if (!cast.length) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {cast.map((s) => (
        <a key={s.tokenId} href={`/enlist/${s.tokenId}`} className="flex items-center gap-3 border border-hairline bg-abyss/60 py-2 pl-2 pr-4 hover:border-signal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portraitUrl(s.tokenId, s.portraitV, true)} alt="" className="h-12 w-12" />
          <span>
            <span className="block font-display text-base text-ink">{s.name}</span>
            <span className="block font-mono text-xs uppercase tracking-[0.2em] text-faint">
              {s.rank} · {s.role}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

// The latest dispatch in full, earlier ones folded underneath.
export default function DispatchView({ dispatches, byId, loaded }: { dispatches: Dispatch[]; byId: Map<number, Survivor>; loaded: boolean }) {
  const [latest, ...earlier] = dispatches;
  return (
    <section className="panel panel-flat sweep p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-base uppercase tracking-[0.35em] text-ember">Field dispatch</p>
        {latest && (
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-faint">
            {fmtDay(latest.day)} · momentum {latest.momentum}
          </p>
        )}
      </div>
      {latest ? (
        <>
          <h2 className="display mt-3 text-balance text-2xl text-ink sm:text-4xl">{latest.title}</h2>
          <Body text={latest.body} />
          <Featured ids={latest.featured} byId={byId} />
        </>
      ) : (
        <p className="mt-3 text-lg text-dim">{loaded ? "The first dispatch from the front is written at 12:00 UTC." : "Loading the dispatch…"}</p>
      )}
      {earlier.length > 0 && (
        <div className="mt-8 border-t border-hairline pt-4">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-faint">Earlier dispatches</p>
          {earlier.map((d) => (
            <details key={d.day} className="group mt-3 border border-hairline px-4 py-3">
              <summary className="cursor-pointer list-none">
                <span className="font-mono text-sm uppercase tracking-[0.25em] text-faint">{fmtDay(d.day)}</span>
                <span className="ml-3 font-display text-lg text-ink group-open:text-signal">{d.title}</span>
              </summary>
              <Body text={d.body} />
              <Featured ids={d.featured} byId={byId} />
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
