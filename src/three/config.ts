/**
 * Phase 9 (traveling orb) tuning and the master kill switch.
 *
 * Set TRAVELING_ORB to false and every Phase 9 code path becomes inert: the
 * canvas goes back to being an absolute layer inside the hero, `scrollState`
 * gains nothing but zeroes, <OrbTravel> collapses to an identity group, and
 * the palette drift never runs. That is the fallback of last resort.
 */
export const TRAVELING_ORB = true;

/**
 * How many viewports of scroll the orb's journey spans.
 *
 * Deliberately normalised in viewport units rather than document length: the
 * LeetCode snapshot can change the page height between builds, and keying the
 * orb's position to document length would make it sit somewhere different for
 * the same scroll position. This is the same normalisation `progress` already
 * uses, just over a longer span.
 */
export const TRAVEL_SPAN = 1.05;

/** Orb size at the end of the journey, as a fraction of its hero size. */
export const AMBIENT_SCALE = 0.34;

/**
 * Fraction of travel spent still glued to the hero composition. Kept small:
 * the orb has to be out of the way by the time the reader reaches the About
 * copy, or it sits behind body text and hurts contrast.
 */
export const TRAVEL_EASE_START = 0.06;

/** Past this much travel the orb is decorative: no hover, no cursor change. */
export const TRAVEL_INERT_AT = 0.18;

/**
 * Destination offset as a fraction of the frustum half-extents at orb depth.
 * Pushed well out so the orb clears the reading column rather than sitting
 * behind it.
 */
export const TRAVEL_OFFSET = {
  landscape: { x: 1.02, y: 0.3 },
  portrait: { x: 0.3, y: 0.58 },
} as const;

/**
 * How far the canvas layer fades as the orb travels. Reached early in the
 * journey, because the orb passes behind the first body copy well before it
 * reaches its final position.
 */
export const LAYER_MIN_OPACITY = 0.3;

/**
 * The one-shot intro in which the starfield converges into the wordmark, holds,
 * and scatters back to its shell.
 *
 * Guarded on every side: skipped under reduced motion, on the low quality tier,
 * after the first view in a browser session, and the moment the reader does
 * anything deliberate (pointer, key, wheel, scroll). The DOM heading is never
 * gated on it, so the readable content arrives on its own schedule regardless.
 */
export const LOAD_MOMENT = true;
