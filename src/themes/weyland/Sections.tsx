import {
  profile,
  education,
  stats,
  experience,
  projects,
  skills,
  leetcode,
} from "@/content";
import { getLeetCodeData } from "@/lib/leetcode";
import { AsciiPortrait } from "./AsciiPortrait";
import {
  OrbitDiagram,
  ProjectDisc,
  SignalTrace,
} from "./Instruments";

/** Every section is a module in one continuous frame, marked off by a rule. */
function Panel({
  id,
  label,
  corner,
  children,
}: {
  id?: string;
  label: string;
  corner?: string;
  children: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-6 border-b border-[var(--wy-line)] px-4 py-2.5 sm:px-6">
        <h2 className="wy-title">{label}</h2>
        {corner ? <p className="wy-micro">{corner}</p> : null}
      </div>
      <div className="px-4 py-7 sm:px-6 sm:py-9">{children}</div>
    </>
  );
  return id ? (
    <section
      id={id}
      className="border-b border-[var(--wy-line)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      {body}
    </section>
  ) : (
    <div className="border-b border-[var(--wy-line)]">{body}</div>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="border-b border-[var(--wy-line)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      <div className="grid lg:grid-cols-[1fr_340px]">
        <div className="border-[var(--wy-line)] p-4 sm:p-6 lg:border-r">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="wy-micro">Personnel file / AP-0904</p>
            <p className="wy-micro">Not to scale</p>
          </div>
          <div className="grid items-center gap-8 xl:grid-cols-[minmax(0,480px)_1fr]">
            <AsciiPortrait />
            <div>
              <h1 className="text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[0.95] tracking-[0.06em] uppercase">
                {profile.name}
              </h1>
              <p className="wy-title mt-3 text-[var(--wy-ink-dim)]">
                {profile.title}
              </p>
              <p className="mt-6 max-w-[46ch] text-sm leading-[1.7]">
                {profile.headline}{" "}
                <span className="text-[var(--wy-alert)]">
                  {profile.headlineAccent}
                </span>
                .
              </p>

              {/* Console command rows, not buttons: a magnetic gloss button is
                  a genre error in an instrument panel. */}
              <div className="mt-8 max-w-[26rem] space-y-2">
                {[
                  ["View array", "#projects", "03"],
                  ["Open comms", "#contact", "06"],
                ].map(([text, href, n]) => (
                  <a
                    key={href}
                    href={href}
                    className="wy-row flex items-baseline gap-3 border-b border-[var(--wy-line)] pb-1.5 text-sm"
                  >
                    <span className="wy-caret inline-block text-[var(--wy-alert)]">
                      &gt;
                    </span>
                    <span className="tracking-[0.08em] uppercase">{text}</span>
                    <span aria-hidden className="wy-leader" />
                    <span className="wy-micro">[ {n} ]</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col">
          <div className="flex items-center justify-between border-b border-[var(--wy-line)] px-4 py-2.5 sm:px-6">
            <p className="wy-micro">Uplink</p>
            <p className="wy-micro flex items-center gap-2 text-[var(--wy-ink)]">
              <span
                aria-hidden
                className="wy-blip inline-block h-[5px] w-[5px] bg-[var(--wy-alert)]"
              />
              Open to work 2026
            </p>
          </div>
          <dl className="grid flex-1 grid-cols-2">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`px-4 py-5 sm:px-6 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b" : ""} border-[var(--wy-line)]`}
              >
                <dd className="text-[1.75rem] leading-none tabular-nums">
                  {s.value}
                </dd>
                <dt className="wy-micro mt-2">{s.label}</dt>
              </div>
            ))}
          </dl>
          <div className="border-t border-[var(--wy-line)] px-4 py-3 sm:px-6">
            <p className="wy-micro">{profile.location}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function About() {
  return (
    <Panel id="about" label="01 / Personnel" corner="Logarithmic view / not to scale">
      <div className="grid gap-9 lg:grid-cols-2 lg:gap-12">
        <div>
          {profile.about.map((para) => (
            <p
              key={para.slice(0, 24)}
              className="mb-4 max-w-[62ch] text-sm leading-[1.7] last:mb-0"
            >
              {para}
            </p>
          ))}
          <dl className="mt-7 border-t border-[var(--wy-line)] pt-4 text-sm">
            {[
              ["Degree", education.degree],
              ["Institution", education.school],
              ["Epoch", education.period],
              ["CGPA", education.cgpa],
            ].map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[8rem_1fr] gap-3 border-b border-[var(--wy-line)] py-2 last:border-b-0"
              >
                <dt className="wy-micro">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <OrbitDiagram />
        </div>
      </div>
    </Panel>
  );
}

export function OperationsLog() {
  return (
    <Panel
      id="experience"
      label="02 / Operations log"
      corner={`${experience.length} entries`}
    >
      <div className="border-t border-[var(--wy-line)]">
        {experience.map((job, i) => (
          // <details> gives keyboard operation and a working no-JS fallback for
          // free, which a div with an onClick would not.
          <details
            key={`${job.company}-${job.period}`}
            open={i === 0}
            className="group border-b border-[var(--wy-line)]"
          >
            <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_1fr] items-baseline gap-3 py-3 text-sm sm:grid-cols-[2.5rem_1.4fr_1.6fr_1fr_1fr]">
              <span className="wy-micro tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="tracking-[0.06em] uppercase">{job.company}</span>
              <span className="hidden text-[var(--wy-ink-dim)] sm:block">
                {job.role}
              </span>
              <span className="wy-micro hidden sm:block">{job.location}</span>
              <span className="wy-micro hidden text-right sm:block">
                {job.period}
              </span>
            </summary>
            <div className="grid grid-cols-[2.5rem_1fr] gap-3 pb-5">
              <span aria-hidden className="wy-micro text-right">
                &#9492;&#9472;
              </span>
              <div>
                <ul className="space-y-1.5">
                  {job.bullets.map((b) => (
                    <li
                      key={b.slice(0, 28)}
                      className="max-w-[76ch] text-sm leading-[1.7]"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="wy-micro mt-3">
                  Stack: {job.stack.join(" · ")}
                </p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </Panel>
  );
}

export function SystemsArray() {
  const widest = Math.max(...skills.map((g) => g.items.length));
  return (
    <Panel id="skills" label="04 / Systems array" corner={`${skills.length} subsystems`}>
      <div className="border-t border-[var(--wy-line)]">
        <div className="wy-micro grid grid-cols-[2.5rem_1fr_3rem] gap-3 border-b border-[var(--wy-line)] py-2 sm:grid-cols-[2.5rem_11rem_1fr_3rem_6rem]">
          <span>Sys</span>
          <span className="hidden sm:block">Subsystem</span>
          <span className="sm:hidden">Subsystem</span>
          <span className="hidden sm:block">Components</span>
          <span className="text-right">N</span>
          <span className="hidden sm:block" />
        </div>
        {skills.map((group, i) => (
          <div
            key={group.group}
            className="grid grid-cols-[2.5rem_1fr_3rem] items-baseline gap-3 border-b border-[var(--wy-line)] py-3 text-sm sm:grid-cols-[2.5rem_11rem_1fr_3rem_6rem]"
          >
            <span className="wy-micro tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="tracking-[0.06em] uppercase">{group.group}</span>
            <span className="col-span-3 text-[var(--wy-ink-dim)] sm:col-span-1">
              {group.items.join(" · ")}
            </span>
            <span className="hidden text-right tabular-nums sm:block">
              {String(group.items.length).padStart(2, "0")}
            </span>
            {/* A real bar, not decoration: it is the one column that lets you
                compare breadth across rows at a glance, and it rhymes with the
                waveform two sections down. */}
            <span aria-hidden className="hidden items-center sm:flex">
              <span
                className="h-px bg-[var(--wy-ink)]"
                style={{ width: `${(group.items.length / widest) * 100}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function Catalogue() {
  return (
    <Panel id="projects" label="03 / Catalogue" corner={`${projects.length} bodies`}>
      <ol className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p, i) => (
          <li key={p.title} className="flex flex-col">
            <div className="flex justify-center">
              <ProjectDisc index={i} />
            </div>
            <p className="wy-micro mt-4">
              Spec-{String(i + 1).padStart(2, "0")} / {p.category}
            </p>
            <h3 className="mt-1 text-sm tracking-[0.06em] uppercase">
              {p.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-[1.65] text-[var(--wy-ink-dim)]">
              {p.description}
            </p>
            <p className="wy-micro mt-3">{p.stack.join(" · ")}</p>
            <div className="mt-3 flex gap-4">
              {p.code ? (
                <a
                  href={p.code}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="wy-micro text-[var(--wy-ink)] underline-offset-4 hover:underline"
                >
                  [ Code ]
                </a>
              ) : null}
              {p.live ? (
                <a
                  href={p.live}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="wy-micro text-[var(--wy-ink)] underline-offset-4 hover:underline"
                >
                  [ Live ]
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

    </Panel>
  );
}

export function Signal() {
  const data = getLeetCodeData();
  const active = data.counts.filter((c) => c > 0).length;
  const mean = (
    data.counts.reduce((a, b) => a + b, 0) / data.counts.length
  ).toFixed(2);

  return (
    <Panel id="coding" label="05 / Signal" corner="Leetcode submission telemetry">
      <SignalTrace counts={data.counts} />

      <dl className="mt-7 grid grid-cols-2 gap-px border border-[var(--wy-line)] bg-[var(--wy-line)] sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Solved", data.solved],
          ["Easy", data.easy],
          ["Medium", data.medium],
          // Zero-padded so an awkward 0 reads as a measurement rather than a gap.
          ["Hard", String(data.hard).padStart(2, "0")],
          ["Streak", data.streak],
          ["Active", active],
        ].map(([k, v]) => (
          <div key={String(k)} className="bg-[var(--wy-ground)] px-4 py-4">
            <dd className="text-[1.5rem] leading-none tabular-nums">{v}</dd>
            <dt className="wy-micro mt-2">{String(k)}</dt>
          </div>
        ))}
      </dl>

      <p className="wy-micro mt-4">
        {data.counts.length} d &middot; peak 12 &middot; mean {mean} &middot;{" "}
        {leetcode.badge}
      </p>
    </Panel>
  );
}
