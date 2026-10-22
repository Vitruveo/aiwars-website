"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Sector, Structure } from "@/lib/scape/sector";

// Machine-built geometry scattered by the sector seed. One instanced mesh per kind, plus an emissive
// cap on every tower and pylon so the skyline reads as lit from inside.
const dummy = new THREE.Object3D();

function Instanced({ items, sector, kind }: { items: Structure[]; sector: Sector; kind: Structure["kind"] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    items.forEach((s, i) => {
      const y = sector.height(s.x, s.z);
      dummy.position.set(s.x, y, s.z);
      dummy.rotation.set(s.lean, s.rot, s.lean * 0.7);
      if (kind === "ring") {
        dummy.position.y = y + s.h * 0.9;
        dummy.rotation.set(Math.PI / 2 + s.lean * 2, s.rot, 0);
        dummy.scale.set(s.w / 2, s.w / 2, 1);
      } else {
        dummy.position.y = y + s.h / 2 - 1;
        dummy.scale.set(s.w, s.h, kind === "slab" ? s.w * 0.6 : s.w);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      const cap = capRef.current;
      if (cap) {
        dummy.position.y = y + s.h - 0.6;
        dummy.scale.set(s.w * 1.02, 0.6, (kind === "slab" ? s.w * 0.6 : s.w) * 1.02);
        dummy.updateMatrix();
        cap.setMatrixAt(i, dummy.matrix);
      }
    });
    m.instanceMatrix.needsUpdate = true;
    if (capRef.current) capRef.current.instanceMatrix.needsUpdate = true;
  }, [items, sector, kind]);

  const glow = sector.palette.structureGlow;
  const caps = kind === "tower" || kind === "pylon";
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow>
        {kind === "ring" ? <torusGeometry args={[1, 0.08, 8, 48]} /> : <boxGeometry args={[1, 1, 1]} />}
        <meshStandardMaterial
          color={sector.palette.structure}
          emissive={glow}
          emissiveIntensity={kind === "ring" ? 1.8 : 0.08}
          roughness={0.6}
          metalness={0.5}
        />
      </instancedMesh>
      {caps && (
        <instancedMesh ref={capRef} args={[undefined, undefined, items.length]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={glow} toneMapped={false} />
        </instancedMesh>
      )}
    </group>
  );
}

export default function Structures({ sector }: { sector: Sector }) {
  const groups = useMemo(() => {
    const by: Record<Structure["kind"], Structure[]> = { tower: [], slab: [], ring: [], pylon: [], wreck: [] };
    for (const s of sector.structures) by[s.kind].push(s);
    return by;
  }, [sector]);
  return (
    <group>
      {(Object.keys(groups) as Structure["kind"][]).map((k) => groups[k].length > 0 && <Instanced key={k} kind={k} items={groups[k]} sector={sector} />)}
    </group>
  );
}
