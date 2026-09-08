import { projects } from "@/content";

/**
 * Projects as a paint-chip catalogue.
 *
 * The reference poster prints each swatch's own hex inside the swatch, so each
 * project tile prints the hex of the ink it is actually printed in. It is true,
 * it is the reference's exact motif, and it turns a grid of text cards into a
 * specimen sheet, which is what solves this theme's real problem: there are no
 * project images anywhere in the repo, and the swatches ARE the plates.
 *
 * Contrast governs what may sit on a tile. Measured on the #1a1a1a ground,
 * cream on brick is 3.52:1 and cream on sage 3.85:1, both of which clear the
 * 3:1 large-text bar and fail the 4.5:1 body bar. So tiles carry ONLY large
 * Anton type, and every small caption lives below the grid on the charcoal
 * ground where cream measures 10.75:1. That split is also the right print
 * gesture: a catalogue sets its plate captions under the plates.
 */
const PLATES = [
  { fill: "var(--rt-brick)", hex: "#B83A2D", ink: "var(--rt-cream)" },
  { fill: "var(--rt-sage)", hex: "#4E6851", ink: "var(--rt-cream)" },
  { fill: "var(--rt-cream)", hex: "#DCC9A9", ink: "var(--rt-char)" },
  { fill: "var(--rt-paper)", hex: "#E8DCC4", ink: "var(--rt-char)" },
] as const;

// Explicit placement: one flagship at 2x2, six at 1x1, and a legend filling the
// cell the flagship's footprint leaves over. 4 cols x 3 rows = 12 = 4 + 6 + 2.
const PLACEMENT = [
  "lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2 sm:col-span-2",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-4 lg:row-start-1",
  "lg:col-start-3 lg:row-start-2",
  "lg:col-start-4 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-2 lg:row-start-3",
];

export function SwatchPlates() {
  return (
    <section
      id="projects"
      className="border-t-2 border-[var(--rt-cream)] text-[var(--rt-cream)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      <div className="mx-auto max-w-[var(--container-page)] px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="rt-display text-[clamp(2.25rem,5vw,4rem)]">
            Selected <span className="text-[var(--rt-brick-txt)]">work</span>
          </h2>
          <p className="rt-caption text-[var(--rt-cream-2)]">
            {projects.length} plates &middot; 2024&ndash;2026
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((p, i) => {
            const plate = PLATES[i % PLATES.length];
            const n = String(i + 1).padStart(2, "0");
            return (
              <article
                key={p.title}
                className={`rt-halftone flex aspect-[4/3] flex-col justify-between rounded-[20px] p-5 sm:aspect-[3/4] ${PLACEMENT[i] ?? ""}`}
                style={{ background: plate.fill, color: plate.ink }}
              >
                <h3
                  className={`rt-display ${
                    i === 0
                      ? "text-[clamp(2rem,3.6vw,3.25rem)]"
                      : "text-[clamp(1.6rem,2.2vw,2rem)]"
                  }`}
                >
                  {p.title}
                </h3>
                <div className="rt-display flex items-baseline justify-between text-[1.5rem] tabular-nums">
                  <span>{n}</span>
                  <span className="opacity-70">{plate.hex}</span>
                </div>
              </article>
            );
          })}

          {/* The leftover cell, used rather than left empty: the palette this
              whole section is printed from, stated outright. */}
          <div className="hidden rounded-[20px] border-2 border-[var(--rt-cream-2)] p-5 lg:col-span-2 lg:col-start-3 lg:row-start-3 lg:flex lg:flex-col lg:justify-between">
            <div className="flex gap-2">
              {PLATES.map((pl) => (
                <div key={pl.hex} className="flex-1">
                  <div
                    className="h-10 rounded-md"
                    style={{ background: pl.fill }}
                  />
                  <p className="rt-caption mt-1.5 text-[var(--rt-cream-2)]">
                    {pl.hex}
                  </p>
                </div>
              ))}
            </div>
            <p className="rt-caption text-[var(--rt-cream-2)]">
              Plate inks &middot; four-colour American retro
            </p>
          </div>
        </div>

        {/* Plate captions. Everything small lives here, on charcoal. */}
        <ol className="mt-12 divide-y divide-[var(--rt-cream-2)]/40 border-t-2 border-[var(--rt-cream)]">
          {projects.map((p, i) => (
            <li
              key={p.title}
              className="grid gap-x-6 gap-y-2 py-5 sm:grid-cols-[4rem_1fr_auto]"
            >
              <span className="rt-display text-[1.75rem] text-[var(--rt-brick-txt)] tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="rt-caption text-[var(--rt-sage-txt)]">
                  {p.category}
                </p>
                <p className="mt-1 max-w-[68ch] text-[1.0625rem] leading-[1.65]">
                  {p.description}
                </p>
                <p className="rt-caption mt-2 text-[var(--rt-cream-2)]">
                  {p.stack.join(" \u00b7 ")}
                </p>
              </div>
              <div className="flex items-start gap-5 sm:justify-end">
                {p.code ? (
                  <a
                    href={p.code}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rt-rule-link rt-caption pb-0.5 text-[var(--rt-cream)]"
                  >
                    Code &#8599;
                  </a>
                ) : null}
                {p.live ? (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rt-rule-link rt-caption pb-0.5 text-[var(--rt-cream)]"
                  >
                    Live &#8599;
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
