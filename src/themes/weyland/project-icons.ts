/**
 * One wireframe per project, drawn to its subject.
 *
 * These replaced seven dithered spheres. A lit sphere is a nice piece of
 * ordered dithering and says nothing: the bank project and the sorting
 * visualiser got the same ball in different sizes, and the only thing that
 * varied was a category glyph nobody decodes. A schematic of the actual thing
 * is both more legible and more in keeping with a theme whose whole language
 * is wireframe instrumentation.
 *
 * PURE ASCII, DELIBERATELY. The first version of these used Unicode box
 * drawing, which looked far better in a terminal and shipped broken. The mono
 * face is loaded through next/font with subsets: ["latin"], and that subset
 * covers roughly U+0000-00FF: it does NOT contain the box-drawing range
 * (U+2500-257F) or the block elements (U+2588). Every rule and every bar
 * therefore fell out of JetBrains Mono into whatever the system offered, at a
 * different advance width, so the verticals no longer lined up with the
 * corners and the boxes visibly came apart. Nothing here may use a character
 * outside Latin-1, and an every-row-is-24-cells check cannot catch that,
 * because the string is the right length and only the rendering is wrong.
 *
 * Every row is exactly ICON_COLS wide and every icon exactly ICON_ROWS tall,
 * which `assertIconGrid` verifies.
 */

export const ICON_COLS = 24;
export const ICON_ROWS = 14;

/**
 * The bar chart, built rather than typed.
 *
 * Hand-typing ten rows of bars is how the first version drifted: two rows had
 * their later bars one cell off, which is invisible in source and obvious on
 * screen. Deriving every row from one array of heights makes that impossible.
 *
 * The values are deliberately unsorted. A visualiser showing a sorted array
 * has nothing left to show.
 */
const BAR_HEIGHTS = [4, 7, 5, 9, 3, 8, 6];

function sortingBars(): string[] {
  const PLOT = 10; // rows of bar above the axis
  const rows: string[] = [];
  for (let r = 0; r < PLOT; r++) {
    const cells = new Array<string>(ICON_COLS).fill(" ");
    BAR_HEIGHTS.forEach((h, j) => {
      if (h < PLOT - r) return;
      cells[2 + j * 3] = "#";
      cells[3 + j * 3] = "#";
    });
    rows.push(cells.join(""));
  }
  rows.push("  " + "-".repeat(ICON_COLS - 2));
  const labels = new Array<string>(ICON_COLS).fill(" ");
  BAR_HEIGHTS.forEach((_, j) => {
    labels[2 + j * 3] = String(j + 1);
  });
  rows.push(labels.join(""));
  rows.push(" ".repeat(ICON_COLS));
  rows.push(" ".repeat(ICON_COLS));
  return rows;
}

/** Keyed by the project title in src/content.ts. */
export const PROJECT_ICONS: Record<string, string[]> = {
  // A request fanning out through a gateway into independent services.
  "Enterprise Food Delivery Microservices Platform": [
    "                        ",
    "                        ",
    "      +----------+      ",
    "      | GATEWAY  |      ",
    "      +----+-----+      ",
    "           |            ",
    "  +--------+--------+   ",
    "  |        |        |   ",
    "+-+--+ +---+---+ +--+--+",
    "| ORD| | PAY   | | DLVR|",
    "+----+ +-------+ +-----+",
    "                        ",
    "   ORDER -> PAY -> SHIP ",
    "                        ",
  ],

  // A marked answer sheet: the output of the thing, not the model behind it.
  "AI Answer Sheet Grader": [
    "                        ",
    "   +------------------+ ",
    "   | Q1 ---------  [+]| ",
    "   | Q2 ---------  [+]| ",
    "   | Q3 ---------  [-]| ",
    "   | Q4 ---------  [+]| ",
    "   +------------------+ ",
    "   | VISION   READER  | ",
    "   | extract  +  mark | ",
    "   +------------------+ ",
    "   | SCORE     84/100 | ",
    "   +------------------+ ",
    "                        ",
    "                        ",
  ],

  // A front page with one story pulled out and scored.
  "Fake News Detector": [
    "                        ",
    "  +--------------------+",
    "  |  T H E   N E W S   |",
    "  +--------------------+",
    "  | -------- +-------+ |",
    "  | -------- | ? ! ? | |",
    "  | -------- |       | |",
    "  | -------- +-------+ |",
    "  | -------- --------- |",
    "  +--------------------+",
    "  | FLAGGED      0.92  |",
    "  +--------------------+",
    "                        ",
    "                        ",
  ],

  // A safe door, with the braces as the thing kept inside it.
  "Developer Snippet Vault": [
    "                        ",
    "  +--------------------+",
    "  |+------------------+|",
    "  ||                  ||",
    "  ||     +------+     ||",
    "  ||  +--+  ()  +--+  ||",
    "  ||  |  +------+  |  ||",
    "  ||  +-----+------+  ||",
    "  ||    { } | { }     ||",
    "  ||        |         ||",
    "  |+------------------+|",
    "  +--------------------+",
    "                        ",
    "                        ",
  ],

  // Mid-sort: an unsorted array with the bars at their real heights.
  "Sorting Visualizer": sortingBars(),

  // A mortarboard: the platform is mentor-led coding education.
  Vidyantar: [
    "                        ",
    "                        ",
    "         +------+       ",
    "    +----+------+----+  ",
    "     \\              /   ",
    "      \\------------/    ",
    "         |    |         ",
    "         |    +---o     ",
    "         |              ",
    "    +----+-----+        ",
    "    |  LEARN > |        ",
    "    +----------+        ",
    "                        ",
    "                        ",
  ],

  // A classical bank facade: pediment, colonnade, steps.
  "Bank Landing Page": [
    "           /\\           ",
    "          /  \\          ",
    "         /    \\         ",
    "        /      \\        ",
    "       /        \\       ",
    "     +-----------+      ",
    "     |  |  |  |  |      ",
    "     |  |  |  |  |      ",
    "     |  |  |  |  |      ",
    "     |  |  |  |  |      ",
    "     +-----------+      ",
    "   +---------------+    ",
    " +-------------------+  ",
    "                        ",
  ],
};

/**
 * Fails loudly on a ragged icon.
 *
 * A row one cell short does not look like a bug, it looks like slightly wonky
 * art, so it survives review and ships. Checking the grid is the only way this
 * stays honest as icons get edited.
 *
 * Also rejects any character outside printable Latin-1, which is the trap that
 * broke the first version: the font subset in use has no glyph for box drawing
 * or block elements, so they silently fall back to another face and the grid
 * comes apart at a width this function would otherwise call correct.
 */
export function assertIconGrid(): string[] {
  const problems: string[] = [];
  for (const [title, rows] of Object.entries(PROJECT_ICONS)) {
    if (rows.length !== ICON_ROWS) {
      problems.push(`${title}: ${rows.length} rows, expected ${ICON_ROWS}`);
    }
    rows.forEach((row, i) => {
      if ([...row].length !== ICON_COLS) {
        problems.push(
          `${title}: row ${i} is ${[...row].length} cells, expected ${ICON_COLS}`,
        );
      }
      const bad = [...row].filter((c) => {
        const cp = c.codePointAt(0) ?? 0;
        return cp < 0x20 || cp > 0x7e;
      });
      if (bad.length) {
        problems.push(
          `${title}: row ${i} has non-ASCII ${bad
            .map((c) => "U+" + c.codePointAt(0)!.toString(16).toUpperCase())
            .join(" ")} - the font subset cannot render it`,
        );
      }
    });
  }
  return problems;
}
