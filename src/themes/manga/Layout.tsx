import { MangaNav } from "./MangaNav";
import {
  Masthead,
  Disciplines,
  About,
  Chapters,
  Catalogue,
  Toolkit,
  Practice,
} from "./Sections";
import { MangaContact, MangaFooter } from "./MangaContact";

/**
 * Retro Japanese comic print.
 *
 * Every section is a ruled panel and the panels sit on the page with a
 * consistent gutter, so it reads as a printed sheet rather than as a scrolling
 * document. Arrows mark the transitions, which is how the reference moves the
 * eye from one block to the next.
 *
 * Three inks, and each has one job: pine carries text, vermillion carries
 * emphasis and fills, indigo carries the secondary voice. Nothing uses a
 * fourth colour, which is what keeps it looking printed rather than designed
 * on a screen.
 */
export function MangaLayout() {
  return (
    <div className="mg-grain min-h-screen bg-[var(--mg-paper)] text-[var(--mg-pine)]">
      <MangaNav />
      <main
        id="content"
        className="mx-auto max-w-[var(--container-page)] px-3 pt-4 sm:px-6"
      >
        <Masthead />
        <Disciplines />
        <div className="mt-3" />
        <About />
        <Chapters />
        <Catalogue />
        <Toolkit />
        <Practice />
        <MangaContact />
      </main>
      <MangaFooter />
    </div>
  );
}
