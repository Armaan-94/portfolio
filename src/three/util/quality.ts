/**
 * Device-tier quality scaling. Picked once on the client from cheap capability
 * hints (cores, memory, pointer type, viewport) so the scene stays at 60 FPS on
 * laptops and phones while capable desktops keep full fidelity. A coarse form
 * of LOD: fewer orb vertices, fewer particles, and a lower pixel-ratio ceiling
 * on weaker hardware.
 */
export type Quality = {
  tier: "low" | "mid" | "high";
  orbDetail: number;
  stars: number;
  dust: number;
  orbital: number;
  maxDpr: number;
};

const PRESETS: Record<Quality["tier"], Quality> = {
  low: { tier: "low", orbDetail: 26, stars: 420, dust: 160, orbital: 120, maxDpr: 1.25 },
  mid: { tier: "mid", orbDetail: 36, stars: 640, dust: 260, orbital: 190, maxDpr: 1.5 },
  high: { tier: "high", orbDetail: 44, stars: 850, dust: 360, orbital: 240, maxDpr: 1.75 },
};

export function getQuality(): Quality {
  if (typeof window === "undefined") return PRESETS.high;

  const cores = navigator.hardwareConcurrency ?? 8;
  // deviceMemory is non-standard (Chromium only); default generously.
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;

  if (coarse || small || cores <= 4 || mem <= 4) return PRESETS.low;
  if (cores <= 8) return PRESETS.mid;
  return PRESETS.high;
}
