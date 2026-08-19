"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { particleFragmentShader, starVertexShader } from "../shaders/particles.glsl";
import { mulberry32, randomUnitVector } from "../util/random";
import { scrollState } from "../interaction";
import { perfState } from "../util/perf";
import { loadMomentState } from "../loadMoment";
import { sampleWordmark, displayFontFamily } from "../util/wordmark";
import { profile } from "@/content";

const INNER = 18;
const OUTER = 44;

/**
 * The furthest depth layer: a large twinkling shell of faint points, well
 * behind the orb, rotating almost imperceptibly. Reads as distant stars /
 * constellation dust and gives the frame real depth.
 */
export function Starfield({
  reduced = false,
  count = 850,
}: {
  reduced?: boolean;
  count?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(0x51f2a);
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const [x, y, z] = randomUnitVector(rand);
      const r = INNER + rand() * (OUTER - INNER);
      pos[i * 3] = x * r;
      pos[i * 3 + 1] = y * r;
      pos[i * 3 + 2] = z * r;
      scale[i] = 0.4 + rand() * 1.1;
      seed[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    // Wordmark slots for the load moment. Sampled once; if it fails (no 2D
    // context, font unavailable) the attribute is all zeroes and the moment
    // simply never has anywhere to assemble to, which <LoadMoment> detects.
    const word = sampleWordmark(profile.name, count, displayFontFamily());
    g.setAttribute(
      "aWord",
      new THREE.BufferAttribute(word ? word.points : new Float32Array(count * 2), 2)
    );
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 34 },
          uPixelRatio: { value: 1 },
          uColorA: { value: new THREE.Color("#cdd8ff") },
          uColorB: { value: new THREE.Color("#6366f1") },
          uAssemble: { value: 0 },
          uWordCenter: { value: new THREE.Vector3() },
          uWordScale: { value: new THREE.Vector2(1, 1) },
        },
      }),
    []
  );

  // Last perf step applied to the draw range. Integer compare per frame; the
  // block below is a no-op until the governor actually steps down.
  const perfVersion = useRef(-1);

  useFrame((state, delta) => {
    if (perfVersion.current !== perfState.version) {
      perfVersion.current = perfState.version;
      geometry.setDrawRange(
        0,
        Math.max(32, Math.floor(count * perfState.particleScale))
      );
    }

    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    if (reduced) return;
    const dt = Math.min(delta, 1 / 30);
    material.uniforms.uTime.value += dt;

    // Load moment. Publishing 0 when idle keeps the shader's branch cold.
    material.uniforms.uAssemble.value = loadMomentState.assemble;
    if (loadMomentState.running) {
      material.uniforms.uWordCenter.value.copy(loadMomentState.center);
      material.uniforms.uWordScale.value.copy(loadMomentState.scale);
    }

    if (pointsRef.current) {
      // Hold the shell still while assembling, or the wordmark would shear as
      // the layer rotates underneath it.
      const settle = 1 - loadMomentState.assemble;
      pointsRef.current.rotation.y +=
        dt * (0.006 + scrollState.velocity * 0.04) * settle;
      // Furthest layer → smallest parallax drift as the hero scrolls out.
      pointsRef.current.position.y = scrollState.progress * 1.2 * settle;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
