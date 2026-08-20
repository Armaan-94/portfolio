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

  // ---- Phase 9 additions. All inert unless <ScrollRig page> is mounted. ----

  /**
   * 0..1 over TRAVEL_SPAN viewports. Drives the orb's journey out to the
   * margin. Viewport-normalised on purpose, so a change in document height
   * (the LeetCode snapshot growing the page) never moves the orb.
   */
  travel: 0,
  /**
   * Undamped `travel`. Used for the canvas fade: damping is right for motion,
   * because it gives the journey inertia, but wrong for legibility, because a
   * fast scroll would outrun the fade and leave the orb washing out the copy
   * for a few hundred milliseconds.
   */
  travelRaw: 0,
  /** 0..1 across the whole document. Damped. Long-range ambience only. */
  pageProgress: 0,
  /** Undamped pageProgress, for thresholds. Never drive motion from this. */
  pageRaw: 0,
};

/**
 * Which section the reader is currently in, mirrored out of the shared
 * scrollspy so `useFrame` callbacks can read it without a React subscription.
 * Same plain-singleton pattern as {@link pointerState}.
 */
export const sectionState = {
  id: "hero",
};

/**
 * The DOM element wrapping the canvas, published so the render loop can fade
 * it as the orb travels. A per-frame style write is far cheaper than a
 * per-frame React render, and the alternative (a binary class toggle keyed to
 * the hero leaving view) dimmed too late and let the orb wash out the copy it
 * was passing behind.
 */
export const orbLayer: { el: HTMLElement | null } = { el: null };
