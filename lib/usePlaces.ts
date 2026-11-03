"use client";

import { useEffect, useMemo, useState } from "react";
import { placeIndex, type Place } from "@/lib/scape/places";

// Every minted shard's tier and sector position, from /api/places. Shared across components on a page.

type Data = { places: Place[]; won: number[] };
let cache: { data: Data; at: number } | null = null;
let inflight: Promise<Data> | null = null;

async function load(): Promise<Data> {
  if (cache && Date.now() - cache.at < 15_000) return cache.data;
  if (!inflight) {
    inflight = fetch("/api/places", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { places: [], won: [] }))
      .then((j: { places: [number, number, number][]; won?: number[] }) => {
        const data = { places: j.places.map(([tokenId, tier, serial]) => ({ tokenId, tier, serial })), won: j.won ?? [] };
        cache = { data, at: Date.now() };
        return data;
      })
      .finally(() => (inflight = null));
  }
  return inflight;
}

export function usePlaces() {
  const [data, setData] = useState<Data>(cache?.data ?? { places: [], won: [] });
  const [loaded, setLoaded] = useState(Boolean(cache));
  useEffect(() => {
    let live = true;
    const run = () => load().then((d) => live && (setData(d), setLoaded(true))).catch(() => {});
    run();
    const id = setInterval(run, 30_000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);
  const index = useMemo(() => placeIndex(data.places), [data.places]);
  const won = useMemo(() => new Set(data.won), [data.won]);
  return { ...index, won, loaded, count: data.places.length };
}
