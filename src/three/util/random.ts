/**
 * Deterministic PRNG helpers for building particle fields. Seeding keeps each
 * field's layout stable between reloads (and identical across HMR), which makes
 * visual tuning predictable — unlike Math.random().
 */

/** mulberry32: tiny, fast, well-distributed 32-bit PRNG. Returns [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random unit vector, uniformly distributed over the sphere. */
export function randomUnitVector(
  rand: () => number
): [number, number, number] {
  // z uniform in [-1,1], azimuth uniform — gives uniform surface distribution.
  const z = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return [r * Math.cos(a), r * Math.sin(a), z];
}
