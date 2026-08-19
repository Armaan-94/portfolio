import { sectionState } from "./interaction";

/**
 * Sections the scene tracks. This is a superset of the nav items: `coding` has
 * no nav entry but is still somewhere the reader spends time, so the orb should
 * react to it.
 */
const SECTION_IDS = [
  "hero",
  "about",
  "experience",
  "projects",
  "skills",
  "coding",
  "contact",
];

/**
 * Publishes the section the reader is currently in to {@link sectionState},
 * for `useFrame` callbacks to read without a React subscription.
 *
 * Deliberately a second, independent observer rather than a refactor of the
 * one in Nav.tsx. Nav's observer feeds the active-link underline and is
 * carefully tuned around which ids count as nav items; sharing it would couple
 * a visual detail of the scene to the correctness of the navigation. One extra
 * observer over seven elements costs nothing, and Nav stays untouched.
 *
 * Uses the same rootMargin as Nav so the orb and the underline agree on where
 * a section begins.
 */
export function startSectionSpy(): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        sectionState.id = entry.target.id;
      }
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }

  return () => {
    observer.disconnect();
    sectionState.id = "hero";
  };
}
