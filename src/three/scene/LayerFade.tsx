"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { orbLayer, scrollState } from "../interaction";
import { LAYER_MIN_OPACITY } from "../config";

/**
 * Fades the canvas layer as the orb travels, and releases its pointer events
 * once the hero is gone.
 *
 * Both are driven per frame from the raw scroll position rather than from React
 * state fed by an IntersectionObserver. The state version was both too late
 * (it could only switch on the hero *fully* leaving the viewport, by which
 * point the orb was already washing out the first paragraphs) and too
 * unreliable for the pointer-events half, where a missed update means the
 * fixed layer silently swallows clicks meant for the content underneath.
 *
 * The layer keeps pointer events while the hero is on screen, because that is
 * what gives the orb its hover swell and cursor tracking. Past the hero it is
 * purely decorative, so it stops taking input entirely.
 */
export function LayerFade({ enabled = false }: { enabled?: boolean }) {
  useFrame(() => {
    const el = orbLayer.el;
    if (!el) return;
    if (!enabled) {
      if (el.style.opacity) el.style.opacity = "";
      if (el.style.pointerEvents) el.style.pointerEvents = "";
      return;
    }
    // Raw, not damped: the fade must never trail a fast scroll.
    const eased = THREE.MathUtils.smootherstep(scrollState.travelRaw, 0, 0.4);
    const target = 1 - (1 - LAYER_MIN_OPACITY) * eased;
    // Two decimals is finer than the eye can tell and keeps the style value
    // stable enough that the compositor is not invalidated every single frame.
    const next = target.toFixed(2);
    if (el.style.opacity !== next) el.style.opacity = next;

    // Release input once the hero has essentially left. Content sections are
    // positioned so they already out-paint this layer, but a decorative layer
    // that still answers clicks is a bug waiting to happen.
    const inert = scrollState.travelRaw > 0.9;
    const pointerEvents = inert ? "none" : "";
    if (el.style.pointerEvents !== pointerEvents) {
      el.style.pointerEvents = pointerEvents;
    }
  });

  return null;
}
