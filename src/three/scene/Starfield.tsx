"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { particleFragmentShader, starVertexShader } from "../shaders/particles.glsl";
import { mulberry32, randomUnitVector } from "../util/random";
import { scrollState } from "../interaction";

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
        },
      }),
    []
  );

  useFrame((state, delta) => {
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    if (reduced) return;
    const dt = Math.min(delta, 1 / 30);
    material.uniforms.uTime.value += dt;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += dt * (0.006 + scrollState.velocity * 0.04);
      // Furthest layer → smallest parallax drift as the hero scrolls out.
      pointsRef.current.position.y = scrollState.progress * 1.2;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
