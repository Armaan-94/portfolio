import * as THREE from "three";
import { ORB_COLORS } from "./materials/OrbMaterial";

export type Swatch = {
  deep: THREE.Color;
  blue: THREE.Color;
  cyan: THREE.Color;
  violet: THREE.Color;
};

type Hex = { deep: string; blue: string; cyan: string; violet: string };

/**
 * Per-section orb palettes.
 *
 * `hero` is exactly ORB_COLORS, so at the top of the page the lerp target is
 * already the material's initial uniform value and the whole system is a
 * mathematical no-op. Hero parity by construction rather than by matching.
 *
 * These are uniform *values*, so a shift costs four CPU-side lerps per frame
 * and nothing at all per pixel. The shader does identical work either way,
 * which matters because the orb fragment stage is already the perf ceiling.
 *
 * Kept here rather than in content.ts: this is render configuration, not copy.
 */
const HEX: Record<string, Hex> = {
  hero: ORB_COLORS,
  // A touch warmer and softer while the reader is on prose.
  about: { deep: "#0a0f1e", blue: "#6f6ff0", cyan: "#5ac2df", violet: "#a6a6f7" },
  // Deeper indigo: the work history reads as the most "serious" section.
  experience: { deep: "#090d1c", blue: "#5b5fe8", cyan: "#46b8dd", violet: "#8f9bf2" },
  // Cooler and more teal, to pick up the project card accents.
  projects: { deep: "#08111c", blue: "#4f7ae8", cyan: "#3fd0e6", violet: "#89aef5" },
  // Brightest, most saturated: the toolkit should feel energetic.
  skills: { deep: "#0a0f20", blue: "#7b6bf5", cyan: "#4bd4ea", violet: "#a99af9" },
  // A nod to the contribution heatmap greens without abandoning the brand.
  coding: { deep: "#08140f", blue: "#4f9be0", cyan: "#3fd39a", violet: "#8fd8c4" },
  // Calm and inviting for the closing section.
  contact: { deep: "#0a0f1e", blue: "#6a72ee", cyan: "#4fc9e8", violet: "#9fa8f6" },
};

/** Colors are built once at module load, so no per-frame allocation. */
const SECTION_SWATCH: Record<string, Swatch> = Object.fromEntries(
  Object.entries(HEX).map(([id, hex]) => [
    id,
    {
      deep: new THREE.Color(hex.deep),
      blue: new THREE.Color(hex.blue),
      cyan: new THREE.Color(hex.cyan),
      violet: new THREE.Color(hex.violet),
    },
  ])
);

const DEFAULT_SWATCH = SECTION_SWATCH.hero;

/** An unknown or renamed section id can never break the scene. */
export function swatchFor(id: string): Swatch {
  return SECTION_SWATCH[id] ?? DEFAULT_SWATCH;
}
