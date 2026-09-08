/**
 * Numeric cubic-bezier evaluator: Newton-Raphson on the curve's own X, which is
 * the same technique the CSS engine uses. A JS animation driven by this eases
 * *identically* to the equivalent CSS curve rather than merely approximating it.
 *
 * This lives in lib rather than inside a component because more than one theme
 * needs to mirror a CSS easing curve in JS, and duplicated copies drift.
 */
export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      const d = sampleDerivX(t);
      if (Math.abs(dx) < 1e-4 || d === 0) break;
      t -= dx / d;
    }
    return sampleY(t);
  };
}

/**
 * The house curve's control points, for libraries that take an easing array.
 *
 * Note this is a JS mirror of --ease-house in globals.css and does NOT read it.
 * A theme that overrides the CSS token will not change motion driven from here,
 * which is deliberate: --ease-house is the default theme's signature curve, and
 * other themes are expected to supply their own timing rather than inherit it.
 */
export const EASE_HOUSE = [0.22, 1, 0.36, 1] as const;

/** --ease-house as a callable progress function. */
export const easeHouse = cubicBezier(
  EASE_HOUSE[0],
  EASE_HOUSE[1],
  EASE_HOUSE[2],
  EASE_HOUSE[3]
);
