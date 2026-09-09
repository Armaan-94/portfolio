import { StudioNav } from "./StudioNav";
import {
  Hero,
  Portrait,
  About,
  Stats,
  Experience,
  Projects,
  Skills,
  Coding,
} from "./Sections";
import { StudioContact, StudioFooter } from "./StudioContact";
import { ThemeDial } from "@/components/shared/ThemeDial";

/**
 * Warm paper, pastel bento.
 *
 * Section order matches the default. A bento gets its variety from the grid,
 * so reordering the content as well would be variety for its own sake.
 *
 * Hue runs butter, pink, mint, sky, peach, lavender, mint, butter, pink. Six
 * hues over nine placements, arranged so no two neighbours share one, and so
 * the page opens and closes on the same note.
 */
export function StudioLayout() {
  return (
    <div className="min-h-screen bg-[var(--st-paper)] text-[var(--st-ink)]">
      <StudioNav />
      <main
        id="content"
        className="mx-auto grid max-w-[var(--container-page)] grid-cols-1 gap-4 px-5 pt-2 pb-10 sm:px-8 lg:grid-cols-12"
      >
        <Hero />
        <Portrait />
        <About />
        <Stats />
        <Experience />
        <Projects />
        <Skills />
        <Coding />
        <StudioContact />
      </main>
      <StudioFooter />
      <ThemeDial current="studio" />
    </div>
  );
}
