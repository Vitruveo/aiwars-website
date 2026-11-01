"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { type Sector } from "@/lib/scape/sector";
import Terrain from "@/components/scape/Terrain";
import Structures from "@/components/scape/Structures";
import Beacon from "@/components/scape/Beacon";
import FlyCamera from "@/components/scape/FlyCamera";
import Effects from "@/components/scape/Effects";
import Markers, { type BeaconRecord } from "@/components/scape/Markers";

export default function ScapeScene({
  sector,
  beacons,
  draft,
  placing,
  onPick,
  locked = false,
  onManual,
  manual,
  won = false,
}: {
  sector: Sector;
  beacons: BeaconRecord[];
  draft?: { x: number; z: number; name: string } | null;
  placing?: boolean;
  onPick?: (x: number, z: number) => void;
  locked?: boolean;
  onManual?: (m: boolean) => void;
  manual: boolean;
  won?: boolean;
}) {
  const p = sector.palette;
  const fogDensity = locked ? sector.fogDensity * 2.6 : sector.fogDensity;
  return (
    <Canvas
      dpr={[1, locked ? 1 : 1.5]}
      camera={{ fov: 58, near: 0.5, far: 1600, position: [120, 60, 120] }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = locked ? 0.55 : 1.05;
        scene.background = new THREE.Color(p.sky);
        scene.fog = new THREE.FogExp2(p.fog, fogDensity);
      }}
      style={{ cursor: placing ? "crosshair" : manual ? "grabbing" : "grab" }}
    >
      <ambientLight intensity={0.35} color="#8fa0ba" />
      <hemisphereLight args={["#2d8cff", p.low, 0.5]} />
      <directionalLight position={[-180, 220, -120]} intensity={1.6} color="#cfe0ff" />
      <directionalLight position={[160, 60, 200]} intensity={0.35} color="#f0954f" />
      <Stars radius={700} depth={120} count={locked ? 800 : 2600} factor={5} saturation={0} fade speed={0.4} />
      <Suspense fallback={null}>
        <Terrain sector={sector} segments={locked ? 110 : 180} onPick={placing && onPick ? (v) => onPick(v.x, v.z) : undefined} />
        <Structures sector={sector} />
        <Beacon sector={sector} />
        <Markers sector={sector} beacons={beacons} draft={draft} won={won} />
      </Suspense>
      <FlyCamera
        sector={sector}
        speed={locked ? 0.5 : 1}
        manual={manual && !locked}
        onManual={(m) => {
          if (!locked) onManual?.(m);
        }}
      />
      <Effects quality={locked ? 0.6 : 1} />
    </Canvas>
  );
}
