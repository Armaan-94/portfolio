import type { CSSProperties } from "react";
import { leetcode } from "@/content";
import { getLeetCodeData, WEEKS, DAYS } from "@/lib/leetcode";

/**
 * Coding activity as a letterpress dot matrix.
 *
 * Retro is the one theme that gets round dots: a screen-printed calendar is
 * struck, not tiled. No green anywhere, because GitHub green is a different
 * design system's signature and would read as a foreign object here. Level 0
 * is an unfilled ring rather than a faint square, so an empty day still shows
 * the grid's rhythm.
 */
const DOT_FILL = [
  "transparent",
  "color-mix(in srgb, var(--rt-cream) 28%, transparent)",
  "var(--rt-sage)",
  "var(--rt-brick)",
  "var(--rt-cream)",
] as const;

export function DotMatrix() {
  const data = getLeetCodeData();

  const figures = [
    { value: data.solved, label: "Problems solved" },
    { value: data.activeDays, label: "Active days" },
    { value: data.streak, label: "Day streak" },
    { value: data.submissionsPastYear, label: "Submissions, past year" },
  ];

  const heatLabel = `LeetCode submission activity over the past year: ${data.activeDays} active days, ${data.solved} problems solved.`;

  return (
    <section
      id="coding"
      className="border-t-2 border-[var(--rt-cream)] text-[var(--rt-cream)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      <div className="mx-auto max-w-[var(--container-page)] px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="rt-display text-[clamp(2.25rem,5vw,4rem)]">
            The <span className="text-[var(--rt-brick-txt)]">practice</span>
          </h2>
          <p className="rt-caption text-[var(--rt-cream-2)]">
            {leetcode.badge}
          </p>
        </div>

        {/* Poster scale is the whole point of putting numbers here. */}
        <dl className="mt-9 grid grid-cols-2 gap-y-9 border-y-2 border-[var(--rt-cream)] py-9 sm:grid-cols-4">
          {figures.map((f) => (
            <div key={f.label}>
              <dd className="rt-display text-[clamp(3rem,7vw,5.5rem)] leading-none tabular-nums">
                {f.value}
              </dd>
              <dt className="rt-caption mt-2 text-[var(--rt-cream-2)]">
                {f.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-10 overflow-x-auto pb-1">
          <div
            className="grid w-max gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${WEEKS}, 10px)`,
              gridAutoFlow: "column",
              gridTemplateRows: `repeat(${DAYS}, 10px)`,
            }}
            role="img"
            aria-label={heatLabel}
          >
            {data.cells.map((level, i) => (
              <span
                key={i}
                className="h-[10px] w-[10px] rounded-full"
                style={
                  {
                    backgroundColor: DOT_FILL[level],
                    boxShadow:
                      level === 0
                        ? "inset 0 0 0 1px color-mix(in srgb, var(--rt-cream) 25%, transparent)"
                        : undefined,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <a
            href={leetcode.url}
            target="_blank"
            rel="noreferrer noopener"
            className="rt-rule-link rt-caption pb-0.5 text-[var(--rt-cream)]"
          >
            LeetCode profile &#8599;
          </a>
          <div className="rt-caption flex items-center gap-1.5 text-[var(--rt-cream-2)]">
            Less
            {DOT_FILL.map((fill, i) => (
              <span
                key={i}
                className="h-[10px] w-[10px] rounded-full"
                style={{
                  backgroundColor: fill,
                  boxShadow:
                    i === 0
                      ? "inset 0 0 0 1px color-mix(in srgb, var(--rt-cream) 25%, transparent)"
                      : undefined,
                }}
              />
            ))}
            More
          </div>
        </div>
      </div>
    </section>
  );
}
