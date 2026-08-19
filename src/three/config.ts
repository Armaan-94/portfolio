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
export const TRAVEL_SPAN = 1.6;

/** Orb size at the end of the journey, as a fraction of its hero size. */
export const AMBIENT_SCALE = 0.42;

/** Fraction of travel spent still glued to the hero composition. */
export const TRAVEL_EASE_START = 0.22;

/** Past this much travel the orb is decorative: no hover, no cursor change. */
export const TRAVEL_INERT_AT = 0.18;

/** Destination offset as a fraction of the frustum half-extents at orb depth. */
export const TRAVEL_OFFSET = {
  landscape: { x: 0.7, y: 0.2 },
  portrait: { x: 0.24, y: 0.52 },
} as const;
