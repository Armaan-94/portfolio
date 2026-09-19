import { RetroNav } from "./RetroNav";
import { Masthead } from "./Masthead";
import { AboutPlate } from "./AboutPlate";
import { SwatchPlates } from "./SwatchPlates";
import { PrintTimeline } from "./PrintTimeline";
import { Specimen } from "./Specimen";
import { DotMatrix } from "./DotMatrix";
import { Comms } from "./Comms";
import { RetroFooter } from "./RetroFooter";
import { ThemePeel } from "@/components/shared/ThemePeel";

/**
 * American-retro poster.
 *
 * Section order differs from the default on purpose: a poster's second spread
 * is always the plates, and the CV timeline is back matter. So projects come
 * before experience here. All seven contract ids are still present, so hash
 * navigation and the scrollspy work exactly as they do everywhere else.
 *
 * The grain overlay hangs off this root. It is a single position:fixed
 * pseudo-element, which means one rasterisation for the whole page and no
 * repaint on scroll; per-section grain would cost both.
 */
export function RetroLayout() {
  return (
    <div className="rt-grain min-h-screen bg-[var(--rt-char)]">
      <RetroNav />
      <main id="content">
        <Masthead />
        <AboutPlate />
        <SwatchPlates />
        <PrintTimeline />
        <Specimen />
        <DotMatrix />
        <Comms />
      </main>
      <RetroFooter />
      <ThemePeel current="retro" />
    </div>
  );
}
