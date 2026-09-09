import { experience, projects } from "@/content";

/* ------------------------------------------------------------------ */
/*  Dithered celestial bodies                                          */
/* ------------------------------------------------------------------ */

/**
 * Ordered dithering, done where it actually belongs.
 *
 * Bayer is wrong for the portrait: a cheek spans about three ramp steps across
 * twenty columns, and a 4x4 pattern injects noise at exactly the spatial
 * frequency of the features it would destroy. A lit sphere is the opposite
 * case, a smooth analytic gradient with no detail to protect, which is
 * precisely what ordered dithering is for.
 *
 * These are computed once at module scope, so seven discs cost 2,352 static
 * characters and nothing at all at runtime.
 */
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

const DISC_COLS = 24;
// A monospace cell is 0.6em wide by 1em tall, so a round disc needs roughly
// 0.6 as many rows as columns. 24 x 14 reads as a circle; 24 x 24 would be an
// egg standing on end.
const DISC_ROWS = 14;

function renderDisc(radius: number, glyph: string): string[] {
  const out: string[] = [];
  for (let y = 0; y < DISC_ROWS; y++) {
    let line = "";
    for (let x = 0; x < DISC_COLS; x++) {
      const nx = (((x + 0.5) / DISC_COLS) * 2 - 1) / radius;
      const ny = (((y + 0.5) / DISC_ROWS) * 2 - 1) / radius;
      const r2 = nx * nx + ny * ny;
      if (r2 > 1) {
        line += " ";
        continue;
      }
      // Lambert for a sphere lit from the upper left, in front, plus an
      // ambient floor. With no ambient the unlit hemisphere empties out
      // completely and the body stops reading as a sphere at all: it becomes a
      // scatter of dots with no silhouette. 0.22 keeps the dark side present.
      const nz = Math.sqrt(1 - r2);
      const lambert = Math.max(0, -0.48 * nx - 0.58 * ny + 0.66 * nz);
      const lit = 0.22 + 0.78 * lambert;
      line += lit ** 0.7 > BAYER4[y % 4][x % 4] ? glyph : " ";
    }
    out.push(line);
  }
  return out;
}

/** Category picks the glyph, so the legend below the strip actually decodes. */
const CATEGORY_GLYPH: Record<string, string> = {
  Backend: "#",
  "AI/ML": "*",
  "Full-stack": "%",
  Algorithms: "=",
  Web: ":",
  Frontend: "-",
};

/** Stack depth picks the radius: a bigger system is a bigger body. */
function radiusFor(stackLength: number) {
  const t = Math.min(1, Math.max(0, (stackLength - 3) / 3));
  return 0.62 + t * 0.38;
}

const DISCS = projects.map((p) =>
  renderDisc(radiusFor(p.stack.length), CATEGORY_GLYPH[p.category] ?? "+")
);

export function ProjectDisc({ index }: { index: number }) {
  return (
    <pre
      aria-hidden
      className="wy-ascii !text-[0.7rem] leading-[1.05] sm:!text-[0.8rem]"
      style={{ contain: "content" }}
    >
      {DISCS[index].join("\n")}
    </pre>
  );
}

export const CATEGORY_LEGEND = Object.entries(CATEGORY_GLYPH);

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
