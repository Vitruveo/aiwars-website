"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { sectorFor, sectorLabel } from "@/lib/scape/sector";
import { usePlaces } from "@/lib/usePlaces";

const ScapeScene = dynamic(() => import("@/components/scape/ScapeScene"), { ssr: false, loading: () => <div className="h-full w-full bg-abyss" /> });

// The Scape flyover as it opens on /scape, over a random sector, inside the Beacon tab.
export default function ActivationScape() {
  const [mounted, setMounted] = useState(false);
  const [id, setId] = useState(1);
  useEffect(() => {
    setId(1 + Math.floor(Math.random() * 5000));
    setMounted(true);
  }, []);
  const [manual, setManual] = useState(false);
  const { byPosition } = usePlaces();
  const tokenHere = byPosition.get(id) ?? null;
  const sector = useMemo(() => sectorFor(id, tokenHere), [id, tokenHere]);

  return (
    <div className="panel panel-flat relative overflow-hidden bg-abyss" style={{ height: "min(56svh, 460px)" }}>
      {mounted && <ScapeScene sector={sector} beacons={[]} manual={manual} onManual={setManual} />}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-6">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-signal">{sector.code}</p>
          <p className="display mt-1 text-2xl text-ink sm:text-3xl">{sector.name}</p>
          <p className="mt-1 font-mono text-sm uppercase tracking-[0.25em] text-faint">
            {sectorLabel(sector)} · Tier {String(sector.tier).padStart(2, "0")} {sector.tierName}
          </p>
        </div>
        <p className="hidden font-mono text-sm uppercase tracking-[0.25em] text-faint sm:block">Sector {String(id).padStart(4, "0")} of 5000 · drag to look</p>
      </div>
    </div>
  );
}
