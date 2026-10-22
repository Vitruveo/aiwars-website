"use client";

import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export default function Effects({ quality = 1 }: { quality?: number }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.25} intensity={1.25 * quality} mipmapBlur radius={0.7} />
      <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0006)} radialModulation modulationOffset={0.4} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
      <Vignette eskil={false} offset={0.2} darkness={0.85} />
    </EffectComposer>
  );
}
