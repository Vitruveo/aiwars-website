"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Sector } from "@/lib/scape/sector";

export type BeaconRecord = { tokenId: number; name: string; x: number; z: number; owner: string };

// Named beacons dropped by holders, plus the one being placed.
export default function Markers({ sector, beacons, draft }: { sector: Sector; beacons: BeaconRecord[]; draft?: { x: number; z: number; name: string } | null }) {
  const items = [...beacons.map((b) => ({ ...b, draft: false })), ...(draft ? [{ ...draft, tokenId: sector.tokenId, owner: "", draft: true }] : [])];
  return (
    <group>
      {items.map((b, i) => {
        const y = Math.max(sector.height(b.x, b.z), -6);
        const color = b.draft ? "#f0954f" : "#2d8cff";
        return (
          <group key={`${b.tokenId}-${i}`} position={[b.x, y, b.z]}>
            <mesh position={[0, 9, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 18, 6]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            <mesh position={[0, 20, 0]}>
              <octahedronGeometry args={[1.6, 0]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
              <ringGeometry args={[4, 4.5, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <Html position={[0, 25, 0]} center distanceFactor={160} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div className={`whitespace-nowrap border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.25em] backdrop-blur-sm ${b.draft ? "border-ember/70 bg-abyss/70 text-ember" : "border-signal/60 bg-abyss/70 text-signal"}`}>
                {b.name || "UNNAMED"}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
