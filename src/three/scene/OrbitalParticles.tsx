"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { orbitalVertexShader, particleFragmentShader } from "../shaders/particles.glsl";
import { mulberry32, randomUnitVector } from "../util/random";
import { pointerState } from "../interaction";

const damp = THREE.MathUtils.damp;

/**
 * A swarm bound to the orb: each particle rides its own tilted great-circle
 * (an orthonormal aU/aV basis) at a seeded radius and speed. When the orb is
 * hovered the whole swarm pulls inward and brightens; a click adds a brief
 * outward flare. This is what makes the orb read as a system, not just a ball.
 */
export function OrbitalParticles({
  reduced = false,
  count = 240,
}: {
  reduced?: boolean;
  count?: number;
}) {
  const attract = useRef(0);

  const geometry = useMemo(() => {
    const rand = mulberry32(0x2c7d1);
    const u = new Float32Array(count * 3);
    const v = new Float32Array(count * 3);
    const radius = new Float32Array(count);
    const speed = new Float32Array(count);
    const phase = new Float32Array(count);
    const scale = new Float32Array(count);
    const seed = new Float32Array(count);

    const n = new THREE.Vector3();
    const uu = new THREE.Vector3();
    const vv = new THREE.Vector3();
    const helper = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // Random orbit-plane normal → orthonormal in-plane basis (uu, vv).
      n.set(...randomUnitVector(rand)).normalize();
      helper.set(Math.abs(n.x) < 0.9 ? 1 : 0, Math.abs(n.x) < 0.9 ? 0 : 1, 0);
      uu.crossVectors(n, helper).normalize();
      vv.crossVectors(n, uu);

      u[i * 3] = uu.x;
      u[i * 3 + 1] = uu.y;
      u[i * 3 + 2] = uu.z;
      v[i * 3] = vv.x;
      v[i * 3 + 1] = vv.y;
      v[i * 3 + 2] = vv.z;

      radius[i] = 2.2 + rand() * 1.5;
      speed[i] = (0.1 + rand() * 0.3) * (rand() < 0.5 ? 1 : -1);
      phase[i] = rand() * Math.PI * 2;
      scale[i] = 0.5 + rand() * 0.9;
      seed[i] = rand();
    }

    const g = new THREE.BufferGeometry();
    // Positions are computed in the shader; a stub keeps the point count/bounds.
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aU", new THREE.BufferAttribute(u, 3));
    g.setAttribute("aV", new THREE.BufferAttribute(v, 3));
    g.setAttribute("aRadius", new THREE.BufferAttribute(radius, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: orbitalVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 62 },
          uPixelRatio: { value: 1 },
          uAttract: { value: 0 },
          uPulse: { value: 0 },
          uColorA: { value: new THREE.Color("#7dd3fc") },
          uColorB: { value: new THREE.Color("#a5b4fc") },
        },
      }),
    []
  );

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uPulse.value = pointerState.pulse;
    if (reduced) {
      u.uAttract.value = 0;
      return;
    }
    const dt = Math.min(delta, 1 / 30);
    u.uTime.value += dt;
    attract.current = damp(attract.current, pointerState.hoverOrb ? 1 : 0, 5, dt);
    u.uAttract.value = attract.current;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
