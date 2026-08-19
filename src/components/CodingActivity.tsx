import type { CSSProperties } from "react";

import { leetcode } from "@/content";
import { getLeetCodeData } from "@/lib/leetcode";
import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { Cascade } from "./Cascade";
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

export function CodingActivity() {
  // Live LeetCode data read from the committed snapshot; falls back gracefully.
  const data = getLeetCodeData();
  const { cells } = data;
  const isLive = data.source === "live";

  const numbers = [
    { label: "Solved", value: data.solved },
    { label: "Easy", value: data.easy },
    { label: "Medium", value: data.medium },
    { label: "Active days", value: data.activeDays },
  ];

  const subtitle =
    `${data.submissionsPastYear} submissions in the past year` +
    (data.streak > 0 ? ` · ${data.streak}-day streak` : "");

  const heatLabel = isLive
    ? `LeetCode submission heatmap: ${data.activeDays} active days in the past year`
    : `Illustrative submission heatmap, roughly ${data.activeDays} active days`;

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
                  <p className="font-mono text-xs text-muted">{subtitle}</p>
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
                <Cascade
                  className="grid w-max gap-[3px]"
                  style={{
                    gridTemplateColumns: `repeat(${WEEKS}, 11px)`,
                    gridAutoFlow: "column",
                    gridTemplateRows: `repeat(${DAYS}, 11px)`,
                  }}
                  role="img"
                  aria-label={heatLabel}
                >
                  {cells.map((level, i) => (
                    <span
                      key={i}
                      className="h-[11px] w-[11px] rounded-[2px]"
                      style={
                        {
                          backgroundColor: HEAT_COLORS[level],
                          "--i": i,
                        } as CSSProperties
                      }
                    />
                  ))}
                </Cascade>
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
