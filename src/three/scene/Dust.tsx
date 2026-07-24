"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { dustVertexShader, particleFragmentShader } from "../shaders/particles.glsl";
import { mulberry32, randomUnitVector } from "../util/random";
import { pointerState, scrollState } from "../interaction";

const R_MIN = 3;
const R_MAX = 15;

/**
 * Mid-distance floating dust that fills the volume around the orb. It drifts
 * slowly on its own and is shoved aside — in screen space — by a fast-moving
 * cursor (see the dust vertex shader), so sweeping the mouse parts the motes
 * like a hand through suspended particles.
 */
export function Dust({
  reduced = false,
  count = 360,
}: {
  reduced?: boolean;
  count?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(0x9e13b);
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const seed = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const [x, y, z] = randomUnitVector(rand);
      // Cube-root-ish bias fills the volume rather than clustering on a shell.
      const r = R_MIN + Math.pow(rand(), 0.5) * (R_MAX - R_MIN);
      pos[i * 3] = x * r;
      pos[i * 3 + 1] = y * r;
      pos[i * 3 + 2] = z * r;
      scale[i] = 0.5 + rand() * 1.1;
      seed[i] = rand();
      speed[i] = 0.3 + rand() * 1.0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dustVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uAspect: { value: 1 },
          uVelocity: { value: 0 },
          uSize: { value: 95 },
          uPixelRatio: { value: 1 },
          uRepelRadius: { value: 0.36 },
          uRepelStrength: { value: 1.4 },
          uColorA: { value: new THREE.Color("#5cc7e6") },
          uColorB: { value: new THREE.Color("#9aa6f5") },
        },
      }),
    []
  );

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uAspect.value = state.size.width / state.size.height;
    u.uPointer.value.copy(pointerState.ndc);
    u.uVelocity.value = reduced ? 0 : pointerState.velocity;
    if (reduced) return;
    // Drift accelerates while scrolling; nearer layer → larger parallax drift.
    u.uTime.value += Math.min(delta, 1 / 30) * (1 + scrollState.velocity * 3);
    if (pointsRef.current) pointsRef.current.position.y = scrollState.progress * 3.2;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
