"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointerState } from "../interaction";

const damp = THREE.MathUtils.damp;

/**
 * Single source of truth for cursor position and speed. Runs at a negative
 * render priority so it updates {@link pointerState} before any consumer reads
 * it in the same frame. Owns nothing visual.
 */
export function PointerTracker({ reduced = false }: { reduced?: boolean }) {
  const prev = useMemo(() => new THREE.Vector2(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    pointerState.ndc.set(state.pointer.x, state.pointer.y);

    if (reduced) {
      pointerState.velocity = 0;
      return;
    }

    const dx = state.pointer.x - prev.x;
    const dy = state.pointer.y - prev.y;
    prev.set(state.pointer.x, state.pointer.y);
    const raw = Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 1e-4);
    pointerState.velocity = damp(
      pointerState.velocity,
      Math.min(raw * 0.32, 1),
      7,
      dt
    );
  }, -10);

  return null;
}
