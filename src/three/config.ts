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

/** Destination offset as a fraction of the frustum half-extents at orb depth. */
export const TRAVEL_OFFSET = {
  landscape: { x: 0.7, y: 0.2 },
  portrait: { x: 0.24, y: 0.52 },
} as const;

/**
 * The one-shot intro in which the starfield converges into the wordmark, holds,
 * and scatters back to its shell.
 *
 * OFF by default, deliberately. The implementation is complete (see
 * scene/LoadMoment.tsx, util/wordmark.ts and the uAssemble branch in the star
 * vertex shader) but it has not been watched running end to end, and an
 * unverified animation on first paint is the wrong thing to gamble on a
 * portfolio's first impression. Flip this to true, load the page in a fresh
 * session, and judge it; everything else about it is already guarded (skipped
 * under reduced motion, on the low tier, after the first view in a session, and
 * on any deliberate input).
 */
export const LOAD_MOMENT = false;
