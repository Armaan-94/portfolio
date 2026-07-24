"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Cinematic post: soft bloom so the orb's fresnel rim and specular highlights
 * bleed light, plus a gentle vignette to focus the frame. Kept minimal for
 * Phase 1; volumetric and depth passes arrive with the world in Phase 2.
 */
export function Effects({ reduced = false }: { reduced?: boolean }) {
  return (
    <EffectComposer enableNormalPass={false} multisampling={reduced ? 0 : 2}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.32}
        mipmapBlur
        radius={0.72}
      />
      <Vignette eskil={false} offset={0.28} darkness={0.65} />
    </EffectComposer>
  );
}
