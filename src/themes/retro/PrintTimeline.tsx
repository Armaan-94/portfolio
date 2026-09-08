import { experience } from "@/content";

/**
 * Experience as a print timeline.
 *
 * The year is set large in a left gutter and printed ONLY when it changes,
 * which for these five entries gives three markers rather than five. That is
 * the device: a catalogue marks the year once and lets the entries hang under
 * it, where a web list would repeat the date on every row. Single column
 * always, because a two-column timeline destroys chronological scanning.
 */
function startYear(period: string): string {
  return period.match(/\d{4}/)?.[0] ?? "";
}

/** "Apr 2026 - Aug 2026" -> "Apr — Aug"; the year is already in the gutter. */
function monthRange(period: string): string {
  const parts = period.split(/\s*[-\u2013\u2014]\s*/);
  const month = (s: string) => s.trim().split(/\s+/)[0] ?? "";
  return parts.length === 2
    ? `${month(parts[0])} \u2014 ${month(parts[1])}`
    : period;
}

export function PrintTimeline() {
  // Precomputed rather than tracked with a running variable during the map:
  // reassigning across a render is impure, and the React Compiler is right to
  // reject it. A year is marked when it differs from the entry above it.
  const years = experience.map((job) => startYear(job.period));
  const marksYear = years.map((y, i) => i === 0 || y !== years[i - 1]);

  return (
    <section
      id="experience"
      className="border-t-2 border-[var(--rt-cream)] text-[var(--rt-cream)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      <div className="mx-auto max-w-[var(--container-page)] px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="rt-display text-[clamp(2.25rem,5vw,4rem)]">
          The <span className="text-[var(--rt-brick-txt)]">record</span>
        </h2>

        <ol className="mt-9">
          {experience.map((job, i) => {
            const year = years[i];
            const isNewYear = marksYear[i];

            return (
              <li
                key={`${job.company}-${job.period}`}
                className={
                  isNewYear
                    ? "border-t-[3px] border-[var(--rt-brick)] pt-6"
                    : "border-t border-[var(--rt-cream-2)]/40 pt-6"
                }
              >
                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[7.5rem_1fr]">
                  <div>
                    {isNewYear ? (
                      <p className="rt-display text-[clamp(2.5rem,5vw,4rem)] leading-none text-[var(--rt-cream)] tabular-nums">
                        {year}
                      </p>
                    ) : null}
                  </div>

                  <div className="pb-9">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="rt-display text-[clamp(1.5rem,2.4vw,2rem)]">
                        {job.company}
                      </h3>
                      <p className="rt-caption text-[var(--rt-sage-txt)]">
                        {monthRange(job.period)} &middot; {job.location}
                      </p>
                    </div>

                    <p className="mt-1 text-[1.0625rem] font-medium">
                      {job.role}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {job.bullets.map((b) => (
                        <li
                          key={b.slice(0, 30)}
                          className="grid max-w-[70ch] grid-cols-[1.25rem_1fr] text-[1.0625rem] leading-[1.65]"
                        >
                          <span
                            aria-hidden
                            className="text-[var(--rt-brick-txt)]"
                          >
                            &#9670;
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Run-in and interpuncted, not chipped. Chips are a web
                        idiom; print sets its metadata as a caption line. */}
                    <p className="rt-caption mt-4 text-[var(--rt-cream-2)]">
                      {job.stack.join(" \u00b7 ")}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
