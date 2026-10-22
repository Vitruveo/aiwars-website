"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { SECTOR_SIZE, SEA, type Sector } from "@/lib/scape/sector";
import { makeNoise2D, fbm, hashSeed } from "@/lib/scape/noise";

// Low-poly terrain: flat shaded facets coloured by height and slope, with glowing energy veins that
// the bloom pass picks up. Built once per sector on the CPU.
export default function Terrain({ sector, segments = 180, onPick }: { sector: Sector; segments?: number; onPick?: (p: THREE.Vector3) => void }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(SECTOR_SIZE, SECTOR_SIZE, segments, segments);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, sector.height(x, z));
    }
    const flat = g.toNonIndexed();
    flat.computeVertexNormals();
    g.dispose();

    const p = sector.palette;
    const low = new THREE.Color(p.low);
    const mid = new THREE.Color(p.mid);
    const high = new THREE.Color(p.high);
    const peak = new THREE.Color(p.peak);
    const vein = new THREE.Color(p.vein);
    const veinNoise = makeNoise2D(hashSeed(sector.seed, 7));
    const fp = flat.attributes.position as THREE.BufferAttribute;
    const fn = flat.attributes.normal as THREE.BufferAttribute;
    const colors = new Float32Array(fp.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < fp.count; i += 3) {
      // one colour per face, sampled at the face centre
      const cx = (fp.getX(i) + fp.getX(i + 1) + fp.getX(i + 2)) / 3;
      const cy = (fp.getY(i) + fp.getY(i + 1) + fp.getY(i + 2)) / 3;
      const cz = (fp.getZ(i) + fp.getZ(i + 1) + fp.getZ(i + 2)) / 3;
      const up = (fn.getY(i) + fn.getY(i + 1) + fn.getY(i + 2)) / 3;
      const h = THREE.MathUtils.clamp((cy - SEA) / 44, 0, 1);
      if (h < 0.35) c.copy(low).lerp(mid, h / 0.35);
      else if (h < 0.7) c.copy(mid).lerp(high, (h - 0.35) / 0.35);
      else c.copy(high).lerp(peak, (h - 0.7) / 0.3);
      // steep faces darken, flat faces catch a little light
      c.multiplyScalar(0.75 + up * 0.35);
      const v = fbm(veinNoise, cx * 0.012, cz * 0.012, 3);
      const band = Math.max(0, 1 - Math.abs(v) / 0.035);
      if (band > 0 && cy > SEA + 0.5) c.lerp(vein, band * band * sector.veins * 1.6);
      for (let k = 0; k < 3; k++) {
        colors[(i + k) * 3] = c.r;
        colors[(i + k) * 3 + 1] = c.g;
        colors[(i + k) * 3 + 2] = c.b;
      }
    }
    flat.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return flat;
  }, [sector, segments]);

  return (
    <group>
      <mesh
        geometry={geometry}
        receiveShadow
        onClick={(e) => {
          if (!onPick) return;
          e.stopPropagation();
          onPick(e.point.clone());
        }}
      >
        <meshStandardMaterial vertexColors flatShading roughness={0.92} metalness={0.08} />
      </mesh>
      {/* haze floor: whatever lies below the sea line is lost in it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA, 0]}>
        <planeGeometry args={[SECTOR_SIZE * 3, SECTOR_SIZE * 3]} />
        <meshStandardMaterial color={sector.palette.fog} roughness={0.3} metalness={0.6} transparent opacity={0.92} />
      </mesh>
    </group>
  );
}
