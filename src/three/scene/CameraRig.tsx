"use client";

import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "../interaction";

const damp = THREE.MathUtils.damp;

/**
 * Apple-level camera drift: the camera leans a few centimetres toward the
 * cursor with very high damping, breathes on the dolly axis, and pulls back a
 * hair toward the screen edges — then always re-centres on the orb. No dramatic
 * rotation, no motion sickness. Disabled entirely under reduced motion.
 */
const BASE_Z = 5;

export function CameraRig({ reduced = false }: { reduced?: boolean }) {
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (reduced) return;
    const dt = Math.min(delta, 1 / 30);
    const px = state.pointer.x;
    const py = state.pointer.y;
    const sp = scrollState.progress;

    // Pointer parallax, eased out as the hero scrolls away so the exit is clean.
    const parallax = 1 - sp;
    camera.position.x = damp(camera.position.x, px * 0.45 * parallax, 2.4, dt);

    // Idle dolly-breath + edge pull-back, plus a scroll dolly that pulls the
    // camera back and lifts it so the orb sinks gracefully out of frame.
    const radius = Math.min(Math.hypot(px, py), 1);
    const targetY = py * 0.3 * parallax + sp * 1.6;
    const targetZ =
      BASE_Z + Math.sin(state.clock.elapsedTime * 0.35) * 0.05 + radius * 0.12 + sp * 3.2;
    camera.position.y = damp(camera.position.y, targetY, 2.4, dt);
    camera.position.z = damp(camera.position.z, targetZ, 2.0, dt);

    // Keep looking at the orb's centre, which itself sinks with scroll.
    camera.lookAt(0, -sp * 1.2, 0);
  });

  return null;
}
