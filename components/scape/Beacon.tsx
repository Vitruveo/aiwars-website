"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Sector } from "@/lib/scape/sector";

// The shard itself, hovering over the sector's centre with a light column reaching into the haze.
export default function Beacon({ sector }: { sector: Sector }) {
  const crystal = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const y = sector.height(0, 0);
  const ember = sector.tier === 1 ? "#f0954f" : "#2d8cff";
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (crystal.current) {
      crystal.current.rotation.y = t * 0.6;
      crystal.current.position.y = y + 16 + Math.sin(t * 1.3) * 1.2;
    }
    if (ring.current) ring.current.rotation.z = t * 0.25;
  });
  return (
    <group>
      <mesh ref={crystal} position={[0, y + 16, 0]}>
        <octahedronGeometry args={[4.2, 0]} />
        <meshStandardMaterial color={ember} emissive={ember} emissiveIntensity={1.1} roughness={0.2} metalness={0.3} flatShading toneMapped={false} />
      </mesh>
      <mesh position={[0, y + 70, 0]}>
        <cylinderGeometry args={[0.9, 2.2, 140, 12, 1, true]} />
        <meshBasicMaterial color={ember} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.6, 0]}>
        <ringGeometry args={[14, 15, 64]} />
        <meshBasicMaterial color={ember} transparent opacity={0.9} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.5, 0]}>
        <ringGeometry args={[22, 22.4, 64]} />
        <meshBasicMaterial color={ember} transparent opacity={0.35} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, y + 18, 0]} color={ember} intensity={900} distance={160} decay={2} />
    </group>
  );
}
