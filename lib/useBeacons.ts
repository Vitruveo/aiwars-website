"use client";

import { useCallback, useEffect, useState } from "react";
import type { BeaconRecord } from "@/components/scape/Markers";

export function useBeacons() {
  const [beacons, setBeacons] = useState<BeaconRecord[]>([]);
  const [won, setWon] = useState<Set<number>>(new Set()); // sectors won in AI Wars Trends
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/beacons", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { beacons: BeaconRecord[]; won?: number[] };
      setBeacons(data.beacons);
      setWon(new Set(data.won ?? []));
    } catch {}
  }, []);
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);
  return { beacons, won, refresh };
}
