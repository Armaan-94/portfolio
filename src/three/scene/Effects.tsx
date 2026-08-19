"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Cinematic post: soft bloom so the orb's fresnel rim and specular highlights
 * bleed light, plus a gentle vignette to focus the frame.
 *
 * Bloom is deliberately not a runtime quality lever. Attaching a ref to
 * <Bloom> so its intensity could be mutated imperatively makes r3f's
 * reconciler throw on mount ("Converting circular structure to JSON"), and
 * driving it by prop would rebuild the effect chain on every quality step.
 * <PerfGovernor> uses dpr and particle draw range instead, which carry most of
 * the win anyway.
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
