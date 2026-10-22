"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Sector } from "@/lib/scape/sector";

// Automatic flyover along the sector's loop. Dragging takes the camera over; after a quiet spell it
// eases back onto the loop from wherever it was left.
const IDLE_MS = 7000;

export default function FlyCamera({ sector, speed = 1, manual, onManual }: { sector: Sector; speed?: number; manual: boolean; onManual: (m: boolean) => void }) {
  const { camera, gl } = useThree();
  const curve = useMemo(() => new THREE.CatmullRomCurve3(sector.path.map((p) => new THREE.Vector3(...p)), true, "centripetal", 0.6), [sector]);
  const t = useRef(0);
  const blend = useRef(1); // 1 = fully on the loop
  const target = useRef(new THREE.Vector3(0, sector.height(0, 0) + 12, 0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  // Latest callback without re-subscribing listeners (which would also clear the idle timer).
  const notify = useRef(onManual);
  notify.current = onManual;

  useEffect(() => {
    t.current = 0;
    blend.current = 1;
    target.current.set(0, sector.height(0, 0) + 12, 0);
  }, [sector]);

  useEffect(() => {
    const el = gl.domElement;
    const grab = () => {
      notify.current(true);
      blend.current = 0;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => notify.current(false), IDLE_MS);
    };
    el.addEventListener("pointerdown", grab);
    el.addEventListener("wheel", grab, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", grab);
      el.removeEventListener("wheel", grab);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [gl]);

  // Parent switched back to auto (button or idle): ease onto the loop from wherever we are.
  useEffect(() => {
    if (!manual) {
      blend.current = 0;
      if (timer.current) clearTimeout(timer.current);
    }
  }, [manual]);

  useFrame((_, dt) => {
    if (manual) return;
    const step = Math.min(dt, 0.05);
    t.current = (t.current + step * 0.012 * speed) % 1;
    blend.current = Math.min(1, blend.current + step * 0.35);
    const k = blend.current * blend.current * (3 - 2 * blend.current);
    const p = curve.getPointAt(t.current);
    const ahead = curve.getPointAt((t.current + 0.04) % 1);
    // look between the beacon and the direction of travel
    const look = ahead.clone().lerp(target.current, 0.55);
    camera.position.lerp(p, k < 1 ? 0.06 + k * 0.4 : 1);
    const q = camera.quaternion.clone();
    camera.lookAt(look);
    camera.quaternion.slerp(q, 1 - Math.min(1, 0.12 + k * 0.88));
    camera.quaternion.slerp(q, 0);
    camera.up.set(0, 1, 0);
  });

  return <OrbitControls ref={controls} enabled={manual} enableDamping dampingFactor={0.08} target={target.current} minDistance={20} maxDistance={420} maxPolarAngle={Math.PI * 0.49} />;
}
