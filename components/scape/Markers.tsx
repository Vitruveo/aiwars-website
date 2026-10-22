"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Sector } from "@/lib/scape/sector";

export type BeaconRecord = { tokenId: number; name: string; x: number; z: number; owner: string };

const PILLAR_H = 220;

// Name plate drawn to a canvas and shown as a sprite, so it always faces the camera and needs no DOM.
function makeLabel(text: string, color: string) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const font = "600 44px 'Share Tech Mono', monospace";
  g.font = font;
  const letter = 10;
  const w = Math.ceil(g.measureText(text).width + letter * text.length) + 80;
  c.width = Math.max(w, 160);
  c.height = 96;
  g.fillStyle = "rgba(4,7,13,0.75)";
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = color;
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, c.width - 3, c.height - 3);
  g.font = font;
  g.fillStyle = color;
  g.textBaseline = "middle";
  let x = 40;
  for (const ch of text) {
    g.fillText(ch, x, c.height / 2 + 2);
    x += g.measureText(ch).width + letter;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: c.width / c.height };
}

function Label({ text, color, y }: { text: string; color: string; y: number }) {
  const { tex, aspect } = useMemo(() => makeLabel(text.toUpperCase(), color), [text, color]);
  const h = 7;
  return (
    <sprite position={[0, y, 0]} scale={[h * aspect, h, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

// A holder's beacon: a light pillar into the sky, a slow sweeping beam, rings pulsing out
// across the ground, and the name floating above. The draft (while placing) is ember.
function BeaconMark({ sector, x, z, name, draft }: { sector: Sector; x: number; z: number; name: string; draft: boolean }) {
  const y = Math.max(sector.height(x, z), -6);
  const color = draft ? "#f0954f" : "#2d8cff";
  const sweep = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Mesh[]>([]);
  const core = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sweep.current) sweep.current.rotation.y = t * 0.7;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const p = ((t * 0.35 + i / 3) % 1);
      m.scale.setScalar(2 + p * 40);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.9;
    });
    if (core.current) core.current.position.y = 10 + Math.sin(t * 2) * 0.8;
  });
  return (
    <group position={[x, y, z]}>
      {/* pillar */}
      <mesh position={[0, PILLAR_H / 2, 0]}>
        <cylinderGeometry args={[1.4, 3.2, PILLAR_H, 12, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, PILLAR_H / 2, 0]}>
        <cylinderGeometry args={[0.35, 0.6, PILLAR_H, 8, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* sweeping beam */}
      <group ref={sweep} position={[0, 10, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2 + 0.18]} position={[45, 8, 0]}>
          <coneGeometry args={[6, 90, 16, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
      {/* core */}
      <mesh ref={core} position={[0, 10, 0]}>
        <octahedronGeometry args={[2.6, 0]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.5, 1.2, 10, 6]} />
        <meshStandardMaterial color="#0b1326" emissive={color} emissiveIntensity={1.5} />
      </mesh>
      {/* pulsing ground rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) rings.current[i] = m;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.5, 0]}
        >
          <ringGeometry args={[1, 1.08, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
        <circleGeometry args={[6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} toneMapped={false} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 14, 0]} color={color} intensity={1400} distance={220} decay={2} />
      <Label text={name || "UNNAMED"} color={color} y={30} />
    </group>
  );
}

export default function Markers({ sector, beacons, draft }: { sector: Sector; beacons: BeaconRecord[]; draft?: { x: number; z: number; name: string } | null }) {
  return (
    <group>
      {beacons.map((b) => (
        <BeaconMark key={b.tokenId} sector={sector} x={b.x} z={b.z} name={b.name} draft={false} />
      ))}
      {draft && <BeaconMark sector={sector} x={draft.x} z={draft.z} name={draft.name} draft />}
    </group>
  );
}
