import { projects } from "@/content";

/**
 * Projects as a paint-chip catalogue.
 *
 * There are no project images anywhere in the repo, so the poster's own logic
 * solves it: each project is a solid ink plate, numbered like a catalogue
 * entry, and the plates themselves carry the page. Nothing has to be
 * illustrated because the colour IS the illustration.
 *
 * Contrast governs what may sit on a tile. Measured on the #1a1a1a ground,
 * cream on brick is 3.52:1 and cream on sage 3.85:1, both of which clear the
 * 3:1 large-text bar and fail the 4.5:1 body bar. So tiles carry ONLY large
 * Anton type, and every small caption lives below the grid on the charcoal
 * ground where cream measures 10.75:1. That split is also the right print
 * gesture: a catalogue sets its plate captions under the plates.
 */
const PLATES = [
  { fill: "var(--rt-brick)", ink: "var(--rt-cream)" },
  { fill: "var(--rt-sage)", ink: "var(--rt-cream)" },
  { fill: "var(--rt-cream)", ink: "var(--rt-char)" },
  { fill: "var(--rt-paper)", ink: "var(--rt-char)" },
] as const;

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
            const lead = i === 0;
            return (
              <article
                key={p.title}
                // The lead plate spans two columns, which is exactly what makes
                // seven items tile a four-column grid with no dead cells:
                // 2 + 1 + 1 on the first row, four singles on the second.
                className={`rt-halftone flex flex-col justify-between rounded-[20px] p-5 ${
                  lead
                    ? "aspect-[5/3] sm:col-span-2 sm:aspect-[5/2] lg:aspect-auto"
                    : "aspect-[5/3] sm:aspect-[5/4]"
                }`}
                style={{ background: plate.fill, color: plate.ink }}
              >
                <h3
                  className={`rt-display ${
                    lead
                      ? "text-[clamp(2rem,3.6vw,3.25rem)]"
                      : "text-[clamp(1.6rem,2.2vw,2rem)]"
                  }`}
                >
                  {p.title}
                </h3>
                <span className="rt-display text-[1.5rem] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </article>
            );
          })}
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
