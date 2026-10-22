"use client";

import { useCallback, useEffect, useState } from "react";
import type { BeaconRecord } from "@/components/scape/Markers";

export function useBeacons() {
  const [beacons, setBeacons] = useState<BeaconRecord[]>([]);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/beacons", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { beacons: BeaconRecord[] };
      setBeacons(data.beacons);
    } catch {}
  }, []);
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);
  return { beacons, refresh };
}
