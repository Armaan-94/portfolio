"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { orbLayer, scrollState } from "../interaction";
import { LAYER_MIN_OPACITY } from "../config";

/**
 * Fades the whole canvas layer down as the orb travels, so body copy the orb
 * passes behind never loses contrast.
 *
 * Driven per frame from `scrollState.travel` rather than from a React state
 * flag: the flag version could only switch on the hero fully leaving the
 * viewport, which is far too late. By then the orb is already sitting over the
 * first paragraphs at full brightness. Writing one style property per frame
 * costs nothing and tracks the journey exactly.
 */
export function LayerFade({ enabled = false }: { enabled?: boolean }) {
  useFrame(() => {
    const el = orbLayer.el;
    if (!el) return;
    if (!enabled) {
      if (el.style.opacity) el.style.opacity = "";
      return;
    }
    // Raw, not damped: the fade must never trail a fast scroll.
    const eased = THREE.MathUtils.smootherstep(scrollState.travelRaw, 0, 0.4);
    const target = 1 - (1 - LAYER_MIN_OPACITY) * eased;
    // Two decimals is finer than the eye can tell and keeps the style value
    // stable enough that the compositor is not invalidated every single frame.
    const next = target.toFixed(2);
    if (el.style.opacity !== next) el.style.opacity = next;
  });

  return null;
}
