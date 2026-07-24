import { leetcode } from "@/content";
import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { LeetCodeIcon, ExternalIcon } from "./Icons";

const WEEKS = 53;
const DAYS = 7;
const HEAT_COLORS = [
  "var(--color-hm-0)",
  "var(--color-hm-1)",
  "var(--color-hm-2)",
  "var(--color-hm-3)",
  "var(--color-hm-4)",
];

/**
 * Deterministic illustrative heatmap. A seeded generator keeps server and
 * client renders identical (no hydration mismatch) and lands close to the
 * real ~173 active days. Not a claim of exact per-day data.
 */
function buildHeatmap() {
  let seed = 20260724;
  const rand = () => {
    // Mulberry32-style LCG, deterministic.
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const cells: number[] = [];
  let active = 0;
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const r = rand();
    // ~47% of cells active, weighted toward lighter greens.
    let level = 0;
    if (r > 0.53) {
      if (r > 0.96) level = 4;
      else if (r > 0.88) level = 3;
      else if (r > 0.72) level = 2;
      else level = 1;
      active++;
    }
    cells.push(level);
  }
  return { cells, active };
}

const { cells } = buildHeatmap();

const numbers = [
  { label: "Solved", value: leetcode.solved },
  { label: "Easy", value: leetcode.easy },
  { label: "Medium", value: leetcode.medium },
  { label: "Active days", value: leetcode.activeDays },
];

export function CodingActivity() {
  return (
    <Section
      id="coding"
      eyebrow="05 / Coding activity"
      title="Consistent reps on the fundamentals."
    >
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-hairline bg-gradient-to-b from-surface to-surface-2">
          <div className="flex flex-col gap-6 p-6 sm:p-8">
            {/* header row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-hairline bg-base text-cyan">
                  <LeetCodeIcon width={20} height={20} />
                </span>
                <div>
                  <p className="font-medium text-ink">LeetCode</p>
                  <p className="font-mono text-xs text-muted">
                    {leetcode.submissionsPastYear} submissions in the past year
                  </p>
                </div>
              </div>
              <a
                href={leetcode.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-indigo hover:text-ink"
              >
                View profile
                <ExternalIcon width={14} height={14} />
              </a>
            </div>

            {/* numbers */}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {numbers.map((n) => (
                <div
                  key={n.label}
                  className="rounded-lg border border-hairline bg-base/40 px-4 py-3"
                >
                  <dt className="font-mono text-[11px] tracking-wide text-muted uppercase">
                    {n.label}
                  </dt>
                  <dd className="mt-0.5 text-xl font-semibold text-ink">
                    {n.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* heatmap */}
            <div>
              <div className="overflow-x-auto pb-1">
                <div
                  className="grid w-max gap-[3px]"
                  style={{
                    gridTemplateColumns: `repeat(${WEEKS}, 11px)`,
                    gridAutoFlow: "column",
                    gridTemplateRows: `repeat(${DAYS}, 11px)`,
                  }}
                  role="img"
                  aria-label={`Illustrative submission heatmap, roughly ${leetcode.activeDays} active days over the past year`}
                >
                  {cells.map((level, i) => (
                    <span
                      key={i}
                      className="h-[11px] w-[11px] rounded-[2px]"
                      style={{ backgroundColor: HEAT_COLORS[level] }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[11px] text-faint">
                  {leetcode.badge}
                </span>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-faint">
                  Less
                  {HEAT_COLORS.map((c, i) => (
                    <span
                      key={i}
                      className="h-[11px] w-[11px] rounded-[2px]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  More
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
