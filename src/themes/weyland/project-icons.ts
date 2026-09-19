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
 * Every row is exactly ICON_COLS cells wide and every icon exactly ICON_ROWS
 * tall, which `assertIconGrid` enforces at module load in development. Box
 * drawing is used rather than block shading because these are diagrams, not
 * images, and because box-drawing characters are reliably single-width in a
 * monospace font where the geometric and dingbat ranges are not.
 */

export const ICON_COLS = 24;
export const ICON_ROWS = 14;

/** Keyed by the project title in src/content.ts. */
export const PROJECT_ICONS: Record<string, string[]> = {
  // A request fanning out through a gateway into independent services.
  "Enterprise Food Delivery Microservices Platform": [
    "      ┌──────────┐      ",
    "      │ GATEWAY  │      ",
    "      └──┬────┬──┘      ",
    "     ┌───┘    └───┐     ",
    "  ┌──┴──┐      ┌──┴──┐  ",
    "  │ ORD │      │ PAY │  ",
    "  └──┬──┘      └──┬──┘  ",
    "     └─────┬──────┘     ",
    "        ┌──┴───┐        ",
    "        │ DLVR │        ",
    "        └──┬───┘        ",
    "       ┌───┴────┐       ",
    "       │ MySQL  │       ",
    "       └────────┘       ",
  ],

  // A marked answer sheet: the output of the thing, not the model behind it.
  "AI Answer Sheet Grader": [
    "                        ",
    "   ┌──────────────────┐ ",
    "   │ Q1 ─────────  [+]│ ",
    "   │ Q2 ─────────  [+]│ ",
    "   │ Q3 ─────────  [-]│ ",
    "   │ Q4 ─────────  [+]│ ",
    "   ├──────────────────┤ ",
    "   │ VISION   READER  │ ",
    "   │ extract  +  mark │ ",
    "   ├──────────────────┤ ",
    "   │ SCORE     84/100 │ ",
    "   └──────────────────┘ ",
    "                        ",
    "                        ",
  ],

  // A front page with one story pulled out and scored.
  "Fake News Detector": [
    "                        ",
    "  ┌────────────────────┐",
    "  │  T H E   N E W S   │",
    "  ├────────────────────┤",
    "  │ ──────── ┌───────┐ │",
    "  │ ──────── │ ? ! ? │ │",
    "  │ ──────── │       │ │",
    "  │ ──────── └───────┘ │",
    "  │ ──────── ───────── │",
    "  ├────────────────────┤",
    "  │ FLAGGED      0.92  │",
    "  └────────────────────┘",
    "                        ",
    "                        ",
  ],

  // A safe door, with the braces as the thing kept inside it.
  "Developer Snippet Vault": [
    "                        ",
    "  ┌────────────────────┐",
    "  │┌──────────────────┐│",
    "  ││                  ││",
    "  ││     ┌──────┐     ││",
    "  ││  ┌──┤  ()  ├──┐  ││",
    "  ││  │  └──────┘  │  ││",
    "  ││  └─────┬──────┘  ││",
    "  ││    { } │ { }     ││",
    "  ││        │         ││",
    "  │└──────────────────┘│",
    "  └────────────────────┘",
    "                        ",
    "                        ",
  ],

  // Mid-sort: an unsorted array with the bars at their real heights.
  "Sorting Visualizer": [
    "                        ",
    "                        ",
    "         █              ",
    "         █         █    ",
    "      █  █         █    ",
    "      █  █  █      █  █ ",
    "      █  █  █      █  █ ",
    "   █  █  █  █   █  █  █ ",
    "   █  █  █  █   █  █  █ ",
    "   █  █  █  █   █  █  █ ",
    "  ──────────────────────",
    "   1  2  3  4   5  6  7 ",
    "                        ",
    "                        ",
  ],

  // A mortarboard: the platform is mentor-led coding education.
  Vidyantar: [
    "                        ",
    "                        ",
    "         ┌──────┐       ",
    "    ┌────┴──────┴────┐  ",
    "     \\              /   ",
    "      \\────────────/    ",
    "         │    │         ",
    "         │    └───o     ",
    "         │              ",
    "    ┌────┴─────┐        ",
    "    │  LEARN > │        ",
    "    └──────────┘        ",
    "                        ",
    "                        ",
  ],

  // A classical bank facade, pediment and colonnade.
  "Bank Landing Page": [
    "                        ",
    "          ┌──┐          ",
    "       ┌──┘  └──┐       ",
    "    ┌──┘        └──┐    ",
    " ┌──┘              └──┐ ",
    " ├────────────────────┤ ",
    " │ ││ ││ ││ ││ ││ ││  │ ",
    " │ ││ ││ ││ ││ ││ ││  │ ",
    " │ ││ ││ ││ ││ ││ ││  │ ",
    " │ ││ ││ ││ ││ ││ ││  │ ",
    " ├────────────────────┤ ",
    " └────────────────────┘ ",
    "                        ",
    "                        ",
  ],
};

/**
 * Fails loudly on a ragged icon.
 *
 * A row one cell short does not look like a bug, it looks like slightly wonky
 * art, so it survives review and ships. Checking the grid is the only way this
 * stays honest as icons get edited.
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
    });
  }
  return problems;
}
