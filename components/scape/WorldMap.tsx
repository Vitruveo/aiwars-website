"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_CELLS, WORLD_RADIUS, cellAt } from "@/lib/scape/layout";
import { tierAtPosition } from "@/lib/scape/places";
import { sectorFor } from "@/lib/scape/sector";

const TIER_COLOR = ["#f0954f", "#5aa6ff", "#2d8cff", "#1b5fd6", "#8fa0ba"];
const WON = "#ffd166"; // Tier 1 tiles are already ember, so won sectors burn gold

// The whole Scape from orbit: 5,000 sectors spiralling out from the Archive, Tier 1 innermost. Sectors
// with a shard placed in them are lit. Everything here is by position (sector number), not token id.
export default function WorldMap({
  occupied,
  mine,
  selected,
  onSelect,
  beaconIds,
  wonIds = new Set(),
  height = 320,
}: {
  occupied: Map<number, number>; // position => token id
  mine: Set<number>;
  selected: number;
  onSelect: (position: number) => void;
  beaconIds: Set<number>;
  wonIds?: Set<number>;
  height?: number;
}) {
  const minted = occupied.size;
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [size, setSize] = useState({ w: 600, h: height });
  const byCell = useMemo(() => {
    const m = new Map<string, number>();
    ALL_CELLS.forEach((c, i) => m.set(`${c.x},${c.y}`, i + 1));
    return m;
  }, []);

  useEffect(() => {
    const el = canvas.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: height }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: height });
    return () => ro.disconnect();
  }, [height]);

  const cellPx = Math.min(size.w, size.h) / (WORLD_RADIUS * 2 + 3);
  const cx = size.w / 2;
  const cy = size.h / 2;

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = size.w * dpr;
    c.height = size.h * dpr;
    const g = c.getContext("2d");
    if (!g) return;
    g.scale(dpr, dpr);
    g.clearRect(0, 0, size.w, size.h);
    const t = performance.now() / 1000;
    // dark cells
    g.fillStyle = "#15223a";
    for (const cell of ALL_CELLS) {
      g.fillRect(cx + cell.x * cellPx - cellPx * 0.4, cy + cell.y * cellPx - cellPx * 0.4, cellPx * 0.8, cellPx * 0.8);
    }
    // lit cells
    for (const id of occupied.keys()) {
      const cell = ALL_CELLS[id - 1];
      if (!cell) continue;
      const tier = tierAtPosition(id) - 1;
      const own = mine.has(id);
      const pulse = 0.75 + 0.25 * Math.sin(t * 2 + id);
      g.fillStyle = TIER_COLOR[tier];
      g.globalAlpha = own ? 1 : 0.85 * pulse;
      g.shadowColor = TIER_COLOR[tier];
      g.shadowBlur = own ? 18 : 10;
      g.fillRect(cx + cell.x * cellPx - cellPx * 0.42, cy + cell.y * cellPx - cellPx * 0.42, cellPx * 0.84, cellPx * 0.84);
      g.shadowBlur = 0;
      g.globalAlpha = 1;
    }
    // sectors with a beacon burn white
    for (const id of beaconIds) {
      const cell = ALL_CELLS[id - 1];
      if (!cell) continue;
      g.fillStyle = "#eef3fb";
      g.shadowColor = "#ffffff";
      g.shadowBlur = 16;
      g.fillRect(cx + cell.x * cellPx - cellPx * 0.42, cy + cell.y * cellPx - cellPx * 0.42, cellPx * 0.84, cellPx * 0.84);
      g.shadowBlur = 0;
    }
    // sectors won in AI Wars Trends burn gold, ringed
    for (const id of wonIds) {
      const cell = ALL_CELLS[id - 1];
      if (!cell) continue;
      const x = cx + cell.x * cellPx;
      const y = cy + cell.y * cellPx;
      const pulse = 0.6 + 0.4 * Math.sin(t * 3 + id);
      g.fillStyle = WON;
      g.shadowColor = WON;
      g.shadowBlur = 20;
      g.fillRect(x - cellPx * 0.42, y - cellPx * 0.42, cellPx * 0.84, cellPx * 0.84);
      g.shadowBlur = 0;
      g.strokeStyle = WON;
      g.globalAlpha = pulse;
      g.lineWidth = 1.5;
      g.strokeRect(x - cellPx * 0.75, y - cellPx * 0.75, cellPx * 1.5, cellPx * 1.5);
      g.globalAlpha = 1;
    }
    // the Archive
    const r = cellPx * 1.6 + Math.sin(t * 1.5) * cellPx * 0.2;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
    grad.addColorStop(0, "rgba(240,149,79,0.9)");
    grad.addColorStop(0.4, "rgba(240,149,79,0.25)");
    grad.addColorStop(1, "rgba(240,149,79,0)");
    g.fillStyle = grad;
    g.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    g.fillStyle = "#f0954f";
    g.beginPath();
    g.moveTo(cx, cy - r);
    g.lineTo(cx + r * 0.7, cy);
    g.lineTo(cx, cy + r);
    g.lineTo(cx - r * 0.7, cy);
    g.closePath();
    g.fill();
    // selection + hover
    for (const [id, stroke] of [[selected, "#eef3fb"], [hover, "#f0954f"]] as [number | null, string][]) {
      if (!id) continue;
      const cell = cellAt(id);
      g.strokeStyle = stroke;
      g.lineWidth = 1.5;
      g.strokeRect(cx + cell.x * cellPx - cellPx * 0.7, cy + cell.y * cellPx - cellPx * 0.7, cellPx * 1.4, cellPx * 1.4);
    }
  });

  // repaint for the pulse
  const [, tick] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      tick((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function idAt(e: React.MouseEvent) {
    const rect = canvas.current!.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - cx) / cellPx);
    const y = Math.round((e.clientY - rect.top - cy) / cellPx);
    return byCell.get(`${x},${y}`) ?? null;
  }

  const hoverSector = hover ? sectorFor(hover, occupied.get(hover) ?? null) : null;
  return (
    <div className="relative w-full" style={{ height }}>
      <canvas
        ref={canvas}
        style={{ width: size.w, height: size.h }}
        className="block cursor-crosshair"
        onMouseMove={(e) => setHover(idAt(e))}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          const id = idAt(e);
          if (id) onSelect(id);
        }}
      />
      <div className="pointer-events-none absolute left-3 top-3 font-mono text-[11px] uppercase tracking-[0.25em] text-faint">
        {hoverSector ? (
          <>
            <span className="text-ink">{hoverSector.code}</span> · {hoverSector.name} · {hoverSector.tierName}
            {wonIds.has(hover!) && <span style={{ color: WON }}> · won in Trends</span>}
            {beaconIds.has(hover!) ? <span className="text-ink"> · beacon</span> : hover && !occupied.has(hover) ? <span className="text-faint"> · unlit</span> : <span className="text-signal"> · lit</span>}
          </>
        ) : (
          <>
            <span className="text-ember">◆</span> the Archive · <span className="text-ink">{minted.toLocaleString("en-US")}</span> of 5,000 sectors lit
          </>
        )}
      </div>
    </div>
  );
}
