"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "../interaction";

const damp = THREE.MathUtils.damp;

/**
 * Reads the native scroll position each frame and turns it into a damped
 * {@link scrollState}. Progress runs 0→1 across the first viewport (the hero);
 * damping gives the scene inertia so it glides rather than snaps. Velocity is
 * the smoothed rate of change, used to accelerate the particle field. Frozen
 * under reduced motion so the hero exit is a plain scroll.
 */
export function ScrollRig({ reduced = false }: { reduced?: boolean }) {
  const prev = useRef(0);

  useFrame((_, delta) => {
    if (reduced) {
      scrollState.progress = 0;
      scrollState.velocity = 0;
      return;
    }
    // Floor dt so a zero-length frame can't produce a divide-by-zero (which
    // would poison velocity with NaN and hide every object that reads it).
    const dt = Math.max(Math.min(delta, 1 / 30), 1e-4);
    const vh = window.innerHeight || 1;
    const raw = Math.min(Math.max(window.scrollY / vh, 0), 1);

    scrollState.progress = damp(scrollState.progress, raw, 5.5, dt);

    const instant = Math.abs(scrollState.progress - prev.current) / dt;
    prev.current = scrollState.progress;
    scrollState.velocity = damp(
      scrollState.velocity,
      Math.min(instant * 3, 1),
      6,
      dt
    );
  });

  return null;
}
