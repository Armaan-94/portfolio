import { experience, projects } from "@/content";
import { ICON_COLS, ICON_ROWS, PROJECT_ICONS } from "./project-icons";

/* ------------------------------------------------------------------ */
/*  Project schematics                                                 */
/* ------------------------------------------------------------------ */

/**
 * A wireframe per project, from ./project-icons.
 *
 * These were dithered spheres: Bayer-ordered Lambert shading, radius from the
 * stack depth, glyph from the category. It was a pretty piece of signal
 * processing that carried almost no information. Every project got a ball, and
 * two projects with the same category and stack size got the *same* ball, so
 * the strip read as decoration. Each project now gets a schematic of what it
 * actually is, which is both legible at a glance and closer to the language
 * the rest of this theme speaks.
 *
 * A project with no bespoke icon falls back to a labelled empty frame rather
 * than throwing, so adding one to content.ts can never break the build.
 */
function fallbackIcon(title: string): string[] {
  const rows: string[] = [];
  const label = title.slice(0, ICON_COLS - 4).toUpperCase();
  for (let y = 0; y < ICON_ROWS; y++) {
    if (y === 0 || y === ICON_ROWS - 1) {
      rows.push("+" + "-".repeat(ICON_COLS - 2) + "+");
    } else if (y === Math.floor(ICON_ROWS / 2)) {
      const pad = ICON_COLS - 2 - label.length;
      const left = Math.floor(pad / 2);
      rows.push("|" + " ".repeat(left) + label + " ".repeat(pad - left) + "|");
    } else {
      rows.push("|" + " ".repeat(ICON_COLS - 2) + "|");
    }
  }
  return rows;
}

const ICONS = projects.map(
  (p) => PROJECT_ICONS[p.title] ?? fallbackIcon(p.title),
);

export function ProjectDisc({ index }: { index: number }) {
  return (
    <pre
      aria-hidden
      className="wy-ascii !text-[0.7rem] leading-[1.05] sm:!text-[0.8rem]"
      style={{ contain: "content" }}
    >
      {ICONS[index].join("\n")}
    </pre>
  );
}

/* ------------------------------------------------------------------ */
/*  Career orbital diagram                                             */
/* ------------------------------------------------------------------ */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function startMonth(period: string): number {
  const i = MONTHS.indexOf(period.trim().slice(0, 3));
  return i < 0 ? 0 : i;
}

/**
 * Five internships as five concentric orbits, innermost most recent, each
 * marker placed at the angle of the month it started.
 *
 * The corner label reads "logarithmic view / not to scale", which is lifted
 * from the reference and also happens to be true of this diagram, which is the
 * joke.
 */
export function OrbitDiagram() {
  const cx = 132;
  const cy = 124;

  return (
    <svg
      viewBox="0 0 420 250"
      className="w-full"
      role="img"
      aria-label={`Career timeline: ${experience.length} roles plotted as concentric orbits, most recent innermost.`}
    >
      <g
        fill="none"
        stroke="var(--wy-line-hot)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      >
        {experience.map((job, i) => (
          <ellipse
            key={`${job.company}-ring`}
            cx={cx}
            cy={cy}
            rx={26 + i * 24}
            ry={12 + i * 11}
          />
        ))}
      </g>

      {experience.map((job, i) => {
        const rx = 26 + i * 24;
        const ry = 12 + i * 11;
        const a = (startMonth(job.period) / 12) * Math.PI * 2 - Math.PI / 2;
        const mx = cx + rx * Math.cos(a);
        const my = cy + ry * Math.sin(a);
        // Labels are stacked on their own evenly spaced rail rather than
        // hung off each marker. Several of these internships begin in
        // neighbouring months, so marker-anchored labels landed on top of one
        // another; the leader line still says which ring each belongs to.
        const ly = 38 + i * 42;
        return (
          <g key={`${job.company}-marker`}>
            <polyline
              points={`${mx},${my} ${262},${ly}`}
              fill="none"
              stroke="var(--wy-line)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={mx - 2}
              y={my - 2}
              width="4"
              height="4"
              fill="var(--wy-ink)"
            />
            <text
              x={268}
              y={ly + 3}
              fill="var(--wy-ink-dim)"
              style={{ fontSize: "9px", letterSpacing: "0.12em" }}
            >
              {job.company.toUpperCase()}
            </text>
            <text
              x={268}
              y={ly + 14}
              fill="var(--wy-line-hot)"
              style={{ fontSize: "8px", letterSpacing: "0.12em" }}
            >
              {job.period.toUpperCase()}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r="3" fill="var(--wy-alert)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Signal waveform                                                    */
/* ------------------------------------------------------------------ */

/**
 * The submission calendar drawn as telemetry rather than as a heat grid.
 *
 * This is what the per-day `counts` added to lib/leetcode.ts are for: the
 * bucketed five-level `cells` are lossy, and a waveform needs real amplitude.
 * Zero days sit exactly on the centre line, which is what produces the
 * flat-line-and-burst texture that makes it read as a signal.
 */
export function SignalTrace({ counts }: { counts: number[] }) {
  const peak = 12;
  const mid = 20;
  const points = counts
    .map((c, i) => {
      const amp = (Math.min(c, peak) / peak) * 18;
      return `${i},${mid - amp}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${counts.length} 40`}
      preserveAspectRatio="none"
      className="h-24 w-full"
      role="img"
      aria-label={`Submission telemetry over ${counts.length} days.`}
    >
      <line
        x1="0"
        y1={mid}
        x2={counts.length}
        y2={mid}
        stroke="var(--wy-line-hot)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--wy-ink)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
