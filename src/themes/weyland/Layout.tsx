import { WeylandNav } from "./WeylandNav";
import {
  Hero,
  About,
  OperationsLog,
  SystemsArray,
  Catalogue,
  Signal,
} from "./Sections";
import { Comms, WeylandFooter } from "./Comms";

/**
 * One continuous instrument, scrolled.
 *
 * The outer frame's side rules run the full height of the page and every
 * section is a module marked off by a horizontal hairline, so the reader
 * scrolls THROUGH the instrument rather than past a stack of separate cards.
 * That is what keeps a scrolling page feeling like a single panel.
 *
 * Skills comes before projects here, unlike every other theme. The log and the
 * array are both dense hairline tables; the catalogue and the waveform are both
 * graphic. An instrument panel wants zones, not alternating stripes.
 */
export function WeylandLayout() {
  return (
    <div className="min-h-screen bg-[var(--wy-ground)] text-[var(--wy-ink)]">
      <WeylandNav />
      <main
        id="content"
        className="mx-auto max-w-[var(--container-page)] border-x border-[var(--wy-line)]"
      >
        <Hero />
        <About />
        <OperationsLog />
        <SystemsArray />
        <Catalogue />
        <Signal />
        <Comms />
        <WeylandFooter />
      </main>
    </div>
  );
}
