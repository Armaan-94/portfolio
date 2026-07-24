import * as THREE from "three";

/**
 * Shared, mutable interaction state read by every reactive system in the scene
 * (orb, dust, orbital particles). It is written once per frame by
 * <PointerTracker> and by the <Orb> (hover/pulse), and read by the rest in
 * their own useFrame callbacks. A plain singleton of refs/scalars, so touching
 * it never triggers a React re-render — the R3F way for per-frame data.
 */
export const pointerState = {
  /** cursor in normalised device coords, -1..1 (x right, y up) */
  ndc: new THREE.Vector2(0, 0),
  /** smoothed cursor speed, ~0..1 */
  velocity: 0,
  /** pointer is currently over the orb */
  hoverOrb: false,
  /** click ripple energy, 0..1, decays over time */
  pulse: 0,
};

/**
 * Scroll state driving the hero's cinematic exit. `progress` is 0 at the top of
 * the page and eases to 1 as the hero scrolls out (damped, so the scene moves
 * with inertia rather than snapping to the raw scroll position — a Lenis-style
 * feel without hijacking native scrolling). `velocity` is the smoothed rate of
 * change, used to briefly accelerate the particles while the user scrolls.
 */
export const scrollState = {
  progress: 0,
  velocity: 0,
};
