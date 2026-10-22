"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReadContract, useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { NFT_CHAIN } from "@/lib/web3";
import { NFT_ADDRESS, NFT_ABI } from "@/lib/contracts";
import { useMyShards } from "@/lib/useMyShards";
import { useBeacons } from "@/lib/useBeacons";
import { sectorFor, BIOME_LABEL } from "@/lib/scape/sector";
import { beaconMessage } from "@/lib/scape/beaconMessage";
import WorldMap from "@/components/scape/WorldMap";

const ScapeScene = dynamic(() => import("@/components/scape/ScapeScene"), { ssr: false, loading: () => <div className="h-full w-full bg-abyss" /> });

// /scape: map and flyover for everyone; beacons for the holder of the sector.
export default function ScapeApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { isConnected, address, tokenIds } = useMyShards();
  const { openConnectModal } = useConnectModal();
  const { beacons, refresh } = useBeacons();
  const { signMessageAsync } = useSignMessage();

  const mintedRead = useReadContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "totalMinted", chainId: NFT_CHAIN.id, query: { enabled: Boolean(NFT_ADDRESS), refetchInterval: 20_000 } });
  const minted = Number((mintedRead.data as bigint | undefined) ?? 0n);

  // Anyone can fly any sector. Holding the sector's shard is what lets you write its beacon.
  const holder = mounted && isConnected && tokenIds.length > 0;
  const [selected, setSelected] = useState<number>(1);
  const [chosen, setChosen] = useState(false);
  useEffect(() => {
    if (chosen) return;
    const fromUrl = Number(new URLSearchParams(window.location.search).get("sector"));
    if (fromUrl >= 1) setSelected(fromUrl);
    else if (tokenIds.length > 0) setSelected(tokenIds[0]);
  }, [tokenIds, chosen]);

  const sector = useMemo(() => sectorFor(selected), [selected]);
  const owns = tokenIds.includes(selected);
  const sectorBeacons = useMemo(() => beacons.filter((b) => b.tokenId === selected), [beacons, selected]);
  const beaconIds = useMemo(() => new Set(beacons.map((b) => b.tokenId)), [beacons]);

  // beacon placement
  const [placing, setPlacing] = useState(false);
  const [draft, setDraft] = useState<{ x: number; z: number; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else stage.current?.requestFullscreen?.();
  }
  useEffect(() => {
    setPlacing(false);
    setDraft(null);
    setNote(null);
  }, [selected]);

  async function saveBeacon() {
    if (!draft || !address) return;
    const name = draft.name.trim();
    if (name.length < 2) return setNote("Name the beacon first");
    setSaving(true);
    setNote(null);
    try {
      const ts = Date.now();
      const signature = await signMessageAsync({ message: beaconMessage(selected, name, draft.x, draft.z, ts) });
      const res = await fetch("/api/beacons", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tokenId: selected, name, x: draft.x, z: draft.z, ts, address, signature }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      await refresh();
      setDraft(null);
      setPlacing(false);
      setNote(`Beacon ${name.toUpperCase()} written`);
    } catch (e) {
      const m = (e as { shortMessage?: string; message?: string })?.shortMessage || (e as Error)?.message || "failed";
      setNote(m.length > 80 ? m.slice(0, 80) + "…" : m);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* flyover */}
      <div ref={stage} className="panel panel-flat relative overflow-hidden bg-abyss" style={{ height: full ? "100svh" : "min(78svh, 820px)" }}>
        {mounted && <ScapeScene sector={sector} beacons={sectorBeacons} draft={draft} placing={placing} onPick={(x, z) => setDraft((d) => ({ x, z, name: d?.name ?? "" }))} onManual={setManual} />}

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-signal">{sector.code}</p>
            <p className="display mt-1 text-2xl text-ink sm:text-4xl">{sector.name}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-faint">
              {BIOME_LABEL[sector.biome]} · Tier {String(sector.tier).padStart(2, "0")} {sector.tierName} · grid {sector.cell.x}, {sector.cell.y}
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="hidden text-right sm:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-faint">{manual ? "Manual orbit" : "Auto flight"}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-faint">Drag to orbit · scroll to zoom</p>
            </div>
            <button
              onClick={toggleFull}
              aria-label={full ? "Exit fullscreen" : "Fullscreen"}
              title={full ? "Exit fullscreen" : "Fullscreen"}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center border border-hairline bg-abyss/70 text-faint transition-colors hover:border-signal hover:text-signal"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                {full ? (
                  <>
                    <path d="M6 1v5H1" /><path d="M10 1v5h5" /><path d="M6 15v-5H1" /><path d="M10 15v-5h5" />
                  </>
                ) : (
                  <>
                    <path d="M1 6V1h5" /><path d="M15 6V1h-5" /><path d="M1 10v5h5" /><path d="M15 10v5h-5" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* bottom bar */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 sm:p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-faint">
            {sectorBeacons.length > 0 ? (
              <>
                Beacon <span className="text-signal">{sectorBeacons[0].name.toUpperCase()}</span>
              </>
            ) : (
              "No beacon in this sector"
            )}
            {note && <p className="mt-1 text-ember">{note}</p>}
          </div>
          {holder && owns && (
            <div className="flex items-center gap-2">
              {placing ? (
                <>
                  <input
                    value={draft?.name ?? ""}
                    onChange={(e) => setDraft((d) => ({ x: d?.x ?? 0, z: d?.z ?? 0, name: e.target.value.slice(0, 24) }))}
                    placeholder={draft ? "Name this place" : "Click the ground"}
                    disabled={!draft}
                    className="h-10 w-48 border border-hairline bg-abyss/80 px-3 font-mono text-sm uppercase tracking-[0.15em] text-ink placeholder:text-faint focus:border-signal focus:outline-none"
                  />
                  <button onClick={saveBeacon} disabled={!draft || saving} className="border border-signal bg-signal/15 text-signal transition-all hover:bg-signal/25 h-10 px-4 font-mono text-xs uppercase tracking-[0.25em] disabled:opacity-50">
                    {saving ? "Signing…" : "Write beacon"}
                  </button>
                  <button
                    onClick={() => {
                      setPlacing(false);
                      setDraft(null);
                    }}
                    className="h-10 border border-hairline px-3 font-mono text-xs uppercase tracking-[0.25em] text-faint hover:text-ink"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setPlacing(true)} className="border border-signal bg-signal/15 text-signal transition-all hover:bg-signal/25 h-10 px-4 font-mono text-xs uppercase tracking-[0.25em]">
                  {sectorBeacons.length > 0 ? "Move beacon" : "Drop a beacon"}
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* map + my sectors */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel panel-flat p-3 lg:col-span-2">
          <WorldMap
            minted={minted}
            mine={tokenIds}
            selected={selected}
            onSelect={(id) => {
              setChosen(true);
              setSelected(id);
            }}
            beaconIds={beaconIds}
            height={600}
          />
        </div>
        <div className="panel panel-flat p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-faint">Your sectors</p>
          {holder ? (
            <ul className="mt-3 space-y-2">
              {tokenIds.map((id) => {
                const s = sectorFor(id);
                return (
                  <li key={id}>
                    <button
                      onClick={() => {
                        setChosen(true);
                        setSelected(id);
                      }}
                      className={`flex w-full items-center justify-between border px-3 py-2 text-left font-mono text-xs uppercase tracking-[0.2em] ${id === selected ? "border-signal text-ink" : "border-hairline text-faint hover:text-ink"}`}
                    >
                      <span>{s.code}</span>
                      <span className="text-signal">{s.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <>
            <p className="mt-3 text-sm text-dim">Sectors are assigned by token id. Token 1 sits beside the Archive; the spiral runs outward through every tier. Hold a shard to light its sector and name a place in it.</p>
            <div className="mt-4 flex gap-3">
              {!isConnected && (
                <button onClick={() => openConnectModal?.()} className="h-10 border border-hairline px-4 font-mono text-xs uppercase tracking-[0.25em] text-faint hover:text-ink">
                  Connect
                </button>
              )}
              <a href="/mint" className="inline-flex h-10 items-center border border-signal bg-signal/15 px-4 font-mono text-xs uppercase tracking-[0.25em] text-signal transition-all hover:bg-signal/25">
                Mint a shard
              </a>
            </div>
            </>
          )}
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-faint">
            <span className="text-ink">{minted.toLocaleString("en-US")}</span> lit · <span className="text-ink">{beacons.length}</span> beacons
          </p>
        </div>
      </div>
    </div>
  );
}
