"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMyShards } from "@/lib/useMyShards";
import { sectorFor } from "@/lib/scape/sector";
import { usePlaces } from "@/lib/usePlaces";
import {
  ROLES, ORIGINS, NAME_MAX, LINE_MAX, enlistMessage, cleanName, cleanLine, portraitUrl,
  type Survivor, type Dispatch,
} from "@/lib/enlist/profile";
import DispatchView from "@/components/enlist/DispatchView";

// /enlist: today's dispatch, the enlist form for the connected holder, and the public roster.
export default function EnlistApp() {
  const [survivors, setSurvivors] = useState<Survivor[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loaded, setLoaded] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/enlist", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { survivors: Survivor[]; dispatches: Dispatch[] };
      setSurvivors(data.survivors);
      setDispatches(data.dispatches);
    } catch {
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const byId = useMemo(() => new Map(survivors.map((s) => [s.tokenId, s])), [survivors]);

  return (
    <div className="flex flex-col gap-10">
      <DispatchView dispatches={dispatches} byId={byId} loaded={loaded} />
      <EnlistPanel byId={byId} onEnlisted={refresh} />
      <Roster survivors={survivors} loaded={loaded} />
    </div>
  );
}

const STAGES = [
  { after: 0, label: "Waiting for your signature" },
  { after: 1, label: "The Archive is writing your survivor" },
  { after: 12, label: "Painting the portrait" },
  { after: 45, label: "Still painting, almost there" },
];

function EnlistPanel({ byId, onEnlisted }: { byId: Map<number, Survivor>; onEnlisted: () => Promise<void> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { isConnected, address, tokenIds } = useMyShards();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();

  const open = tokenIds.filter((id) => !byId.has(id));
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    if (selected === null || !open.includes(selected)) setSelected(open[0] ?? null);
  }, [open.join(","), selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [origin, setOrigin] = useState("");
  const [before, setBefore] = useState("");
  const [look, setLook] = useState("");
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (elapsed < 1) return;
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed]);
  const stage = [...STAGES].reverse().find((s) => elapsed >= s.after)?.label;

  const form = { name: cleanName(name), role, origin, before: cleanLine(before), look: cleanLine(look) };
  const ready = selected !== null && form.name.length >= 2 && role && origin && !busy;

  async function enlist() {
    if (!ready || selected === null || !address) return;
    setBusy(true);
    setError(null);
    setElapsed(0);
    try {
      const ts = Date.now();
      const signature = await signMessageAsync({ message: enlistMessage(selected, form, ts) });
      setElapsed(1);
      const res = await fetch("/api/enlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tokenId: selected, ...form, ts, address, signature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "enlistment failed");
      await onEnlisted();
      window.location.href = `/enlist/${selected}`;
    } catch (e) {
      const m = (e as { shortMessage?: string; message?: string })?.shortMessage || (e as Error)?.message || "failed";
      setError(m.length > 140 ? m.slice(0, 140) + "…" : m);
      setBusy(false);
      setElapsed(-1);
    }
  }

  const { byToken } = usePlaces();
  const place = selected ? byToken.get(selected) : undefined;
  const sector = selected && place ? sectorFor(place.position, selected) : null;

  return (
    <section className="panel panel-flat p-6 sm:p-8">
      <p className="font-mono text-base uppercase tracking-[0.35em] text-ember">Enlist your survivor</p>
      <h2 className="display mt-2 text-balance text-2xl text-ink sm:text-3xl">One survivor per shard</h2>
      <p className="mt-2 max-w-3xl text-pretty text-lg text-dim">
        Name them, pick their role and where they came from. The Archive writes their story and paints their portrait. They appear in the daily dispatch and carry into the game when it ships.
      </p>

      <div className="rule my-6" />

      {!mounted ? null : !isConnected ? (
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-lg text-dim">Connect the wallet that holds your shard.</p>
          <button type="button" onClick={openConnectModal} className="border border-signal bg-signal px-6 py-3 font-mono text-base uppercase tracking-[0.25em] text-abyss hover:bg-ink">
            Connect
          </button>
        </div>
      ) : tokenIds.length === 0 ? (
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-lg text-dim">You need an Archive Shard to enlist. Anyone can read the dispatch; only holders are in it.</p>
          <a href="/mint" className="border border-signal bg-signal px-6 py-3 font-mono text-base uppercase tracking-[0.25em] text-abyss hover:bg-ink">
            Mint a shard
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* the holder's shards */}
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-faint">Your shards</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tokenIds.map((id) => {
                const s = byId.get(id);
                if (s)
                  return (
                    <a key={id} href={`/enlist/${id}`} className="flex items-center gap-3 border border-hairline px-3 py-2 hover:border-signal">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={portraitUrl(id, s.portraitV, true)} alt="" className="h-10 w-10" />
                      <span className="font-mono text-sm uppercase tracking-[0.2em] text-ink">
                        #{id} · {s.name}
                      </span>
                    </a>
                  );
                const on = id === selected;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelected(id)}
                    disabled={busy}
                    className={`border px-4 py-3 font-mono text-sm uppercase tracking-[0.2em] ${on ? "border-ember bg-ember/10 text-ember" : "border-hairline text-dim hover:border-dim hover:text-ink"}`}
                  >
                    #{id} · not enlisted
                  </button>
                );
              })}
            </div>
          </div>

          {selected === null ? (
            <p className="text-lg text-dim">Every shard you hold has a survivor. Their cards are linked above.</p>
          ) : (
            <div className="flex flex-col gap-6">
              <p className="text-lg text-dim">
                Enlisting for shard <span className="text-ink">#{selected}</span>, home sector <span className="text-ink">{sector?.name}</span>.
              </p>

              <label className="block">
                <span className="font-mono text-sm uppercase tracking-[0.3em] text-faint">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={NAME_MAX}
                  disabled={busy}
                  placeholder="e.g. Ines Varga"
                  className="mt-2 block w-full max-w-md border border-hairline bg-abyss px-4 py-3 text-lg text-ink outline-none focus:border-signal"
                />
              </label>

              <fieldset>
                <legend className="font-mono text-sm uppercase tracking-[0.3em] text-faint">Role</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {ROLES.map((r) => (
                    <Choice key={r.name} on={role === r.name} disabled={busy} onClick={() => setRole(r.name)} title={r.name} text={r.what} />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-mono text-sm uppercase tracking-[0.3em] text-faint">Origin</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {ORIGINS.map((o) => (
                    <Choice key={o.name} on={origin === o.name} disabled={busy} onClick={() => setOrigin(o.name)} title={o.name} text={o.what} />
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-sm uppercase tracking-[0.3em] text-faint">Before the fall (optional)</span>
                  <input
                    value={before}
                    onChange={(e) => setBefore(e.target.value)}
                    maxLength={LINE_MAX}
                    disabled={busy}
                    placeholder="e.g. ran the night tram on the east line"
                    className="mt-2 block w-full border border-hairline bg-abyss px-4 py-3 text-lg text-ink outline-none focus:border-signal"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-sm uppercase tracking-[0.3em] text-faint">Look or gear (optional)</span>
                  <input
                    value={look}
                    onChange={(e) => setLook(e.target.value)}
                    maxLength={LINE_MAX}
                    disabled={busy}
                    placeholder="e.g. grey braid, cracked visor, signal flares"
                    className="mt-2 block w-full border border-hairline bg-abyss px-4 py-3 text-lg text-ink outline-none focus:border-signal"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={enlist}
                  disabled={!ready}
                  className="border border-ember bg-ember px-8 py-4 font-mono text-base font-bold uppercase tracking-[0.3em] text-abyss transition-colors hover:bg-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? "Enlisting…" : "Enlist"}
                </button>
                {busy && stage && <span className="font-mono text-sm uppercase tracking-[0.25em] text-signal">{stage}</span>}
                {!busy && !error && <span className="text-base text-faint">Signing is free. The name is permanent; the portrait can be redone three times.</span>}
                {error && <span className="text-base text-ember">{error}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Choice({ on, disabled, onClick, title, text }: { on: boolean; disabled: boolean; onClick: () => void; title: string; text: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`border px-4 py-3 text-left transition-colors ${on ? "border-ember bg-ember/10" : "border-hairline hover:border-dim"}`}
    >
      <span className={`block font-mono text-sm uppercase tracking-[0.25em] ${on ? "text-ember" : "text-ink"}`}>{title}</span>
      <span className="mt-1 block text-base text-dim">{text}</span>
    </button>
  );
}

function Roster({ survivors, loaded }: { survivors: Survivor[]; loaded: boolean }) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="display text-2xl text-ink sm:text-3xl">The roster</h2>
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-faint">
          <span className="text-ink">{survivors.length}</span> enlisted
        </p>
      </div>
      {loaded && survivors.length === 0 ? (
        <p className="mt-4 text-lg text-dim">No one has enlisted yet. The first survivors will be named in tomorrow&apos;s dispatch.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {survivors.map((s) => (
            <a key={s.tokenId} href={`/enlist/${s.tokenId}`} className="group panel panel-flat overflow-hidden transition-colors hover:border-signal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portraitUrl(s.tokenId, s.portraitV, true)} alt={s.name} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="truncate font-display text-lg text-ink group-hover:text-signal">{s.name}</p>
                {s.epithet && <p className="truncate text-sm text-ember">{s.epithet}</p>}
                <p className="mt-1 truncate font-mono text-xs uppercase tracking-[0.2em] text-faint">
                  {s.rank} · {s.role}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
