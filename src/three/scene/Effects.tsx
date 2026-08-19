"use client";

import { useRef } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import type { BloomEffect } from "postprocessing";
import { perfState } from "../util/perf";

const BASE_BLOOM = 0.85;

/**
 * Cinematic post: soft bloom so the orb's fresnel rim and specular highlights
 * bleed light, plus a gentle vignette to focus the frame.
 *
 * Bloom intensity is mutated through a ref rather than driven by a prop, so a
 * quality step-down never re-renders <EffectComposer> and never rebuilds the
 * effect chain. Multisampling stays a prop because it only depends on reduced
 * motion, which does not change mid-session.
 */
export function Effects({ reduced = false }: { reduced?: boolean }) {
  const bloom = useRef<BloomEffect>(null);
  const applied = useRef(-1);

  useFrame(() => {
    if (applied.current === perfState.version) return;
    applied.current = perfState.version;
    if (bloom.current) {
      bloom.current.intensity = BASE_BLOOM * perfState.bloomScale;
    }
  });

  return (
    <EffectComposer enableNormalPass={false} multisampling={reduced ? 0 : 2}>
      <Bloom
        ref={bloom}
        intensity={BASE_BLOOM}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.32}
        mipmapBlur
        radius={0.72}
      />
      <Vignette eskil={false} offset={0.28} darkness={0.65} />
    </EffectComposer>
  );
}
