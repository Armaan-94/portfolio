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

function cores() {
  return navigator.hardwareConcurrency ?? 8;
}

function memory() {
  // deviceMemory is non-standard (Chromium only); default generously.
  return (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
}

function coarsePointer() {
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}

export function getQuality(): Quality {
  if (typeof window === "undefined") return PRESETS.high;

  const small = Math.min(window.innerWidth, window.innerHeight) < 700;

  if (coarsePointer() || small || cores() <= 4 || memory() <= 4) {
    return PRESETS.low;
  }
  if (cores() <= 8) return PRESETS.mid;
  return PRESETS.high;
}

/**
 * Whether this device should get the traveling orb.
 *
 * Deliberately NOT "tier is not low". The tier drops to low on any viewport
 * whose smaller side is under 700px, which is the right call for render cost
 * but wrong as a travel gate: it disables the effect on perfectly capable
 * desktops in a half-height window. What travel actually needs to avoid is a
 * touch device, where `position: fixed` plus 100svh plus momentum scrolling is
 * a bug farm, and hardware too weak to render continuously past the hero.
 *
 * So: a fine pointer, and not obviously underpowered. Viewport size is
 * irrelevant here; the quality tier still scales the render either way.
 */
export function canTravel(): boolean {
  if (typeof window === "undefined") return false;
  return !coarsePointer() && cores() > 4 && memory() > 4;
}
