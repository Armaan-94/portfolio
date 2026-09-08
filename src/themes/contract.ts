import type { ReactNode } from "react";

/**
 * The section ids every theme must render.
 *
 * These are load-bearing in four separate places, none of which fail loudly:
 *   - `nav` in content.ts links to five of them by hash
 *   - Nav's IntersectionObserver observes them to drive the active indicator
 *   - src/three/sectionSpy.ts uses them to lerp the orb palette per section
 *   - globals.css scroll-padding positions the landing point
 *
 * A theme that omits one does not throw. The nav indicator simply sticks, or a
 * hash link scrolls nowhere, which is the kind of bug that survives review.
 * ContractCheck below turns that into a console error during development.
 */
export const SECTION_IDS = [
  "hero",
  "about",
  "experience",
  "projects",
  "skills",
  "coding",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/**
 * Theme layouts take no props. Everything they render comes from `@/content`
 * and `@/lib/leetcode`, both of which are presentation-agnostic, so a theme is
 * purely a rendering of shared data and can never drift from another theme's
 * copy of it.
 */
export type ThemeLayout = () => ReactNode;

/**
 * Development-only assertion that the rendered theme honours the contract.
 *
 * This is a plain inline script rather than a client component on purpose. A
 * client component would be compiled into the page's shared chunk and shipped
 * to every visitor even when the NODE_ENV branch never renders it, because the
 * import alone emits a client reference. A string that the server simply does
 * not print in production is absent from the build entirely.
 */
export function contractCheckScript(): string {
  const ids = JSON.stringify([...SECTION_IDS]);
  return `(function(){var m=${ids}.filter(function(i){return !document.getElementById(i)});if(m.length)console.error("[theme] missing section ids: "+m.map(function(i){return "#"+i}).join(", ")+". Hash navigation, the nav scrollspy and the orb's per-section palette all key off these. See src/themes/contract.ts.");if(!document.getElementById("content"))console.error("[theme] missing #content. The skip link in app/layout.tsx targets it.")})();`;
}
