import Image from "next/image";
import type { CSSProperties } from "react";
import {
  profile,
  education,
  stats,
  experience,
  projects,
  skills,
  leetcode,
} from "@/content";
import { getLeetCodeData, WEEKS, DAYS } from "@/lib/leetcode";
import { Panel, Ribbon, Stamp, Arrows, Tone } from "./Panels";

/* ------------------------------------------------------------------ */
/*  Masthead                                                           */
/* ------------------------------------------------------------------ */

export function Masthead() {
  return (
    <section id="hero" style={{ scrollMarginTop: "var(--scroll-pad)" }}>
      {/* The greeting block, straight off the reference: an enormous word, a
          rule, then a subtitle bar, with a price-tag box holding the corner. */}
      <div className="mg-panel mg-panel-red">
        <div className="grid sm:grid-cols-[1fr_auto]">
          <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
            <h1 className="mg-display mg-misprint text-[clamp(3.5rem,13vw,8rem)] text-[var(--mg-verm)]">
              Hello!
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t-[2.5px] border-[var(--mg-verm)] pt-3">
              <p className="mg-label text-[var(--mg-verm-ink)]">
                Kon&apos;nichiwa
              </p>
              <span aria-hidden className="h-4 w-px bg-[var(--mg-verm)]" />
              <p className="mg-label text-[var(--mg-pine)]">
                Here is my portfolio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t-[2.5px] border-[var(--mg-verm)] px-4 py-4 sm:border-t-0 sm:border-l-[2.5px] sm:px-6">
            <div>
              <p className="mg-label text-[var(--mg-pine)]">Special edition</p>
              <p className="mg-display mt-1 text-[2.5rem] text-[var(--mg-verm)]">
                No.01
              </p>
              <p className="mg-label mt-1 text-[var(--mg-indigo)]">Est. 2026</p>
            </div>
            <Stamp lines={["Open", "to", "work"]} ink="blue" />
          </div>
        </div>
      </div>

      {/* Name bar */}
      <div className="mg-panel mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
        <p className="mg-label text-[var(--mg-verm-ink)]">My name is</p>
        <p className="mg-display text-[clamp(1.5rem,4vw,2.75rem)] text-[var(--mg-pine)]">
          {profile.name}
        </p>
      </div>

      {/* Portrait panel with focus lines, and the deck beside it. */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="mg-panel relative overflow-hidden px-4 py-5 sm:px-6 sm:py-7">
          <Ribbon className="absolute top-0 left-4 sm:left-6">
            Also known as
          </Ribbon>
          <div
            className="mg-burst mt-9 grid items-center gap-6 text-[var(--mg-verm)] sm:grid-cols-[15rem_1fr]"
            style={{ "--mg-burst-opacity": 0.22 } as CSSProperties}
          >
            {/* A drawn panel rather than an avatar: the portrait is inked to
                a single colour with a transparent ground, so the red
                screentone behind it reads through the paper areas the way a
                tone sheet laid under a drawing does. */}
            <Tone tone={0.34} ink="red" className="mx-auto w-full max-w-[15rem]">
              <div className="relative aspect-[4/5] overflow-hidden border-[3px] border-[var(--mg-pine)]">
                <Image
                  src="/manga-portrait.png"
                  alt={`${profile.name}, ${profile.title}`}
                  fill
                  sizes="15rem"
                  className="object-cover object-top"
                />
              </div>
            </Tone>
            <div className="text-[var(--mg-pine)]">
              <p className="mg-display text-[clamp(1.75rem,4.4vw,3rem)]">
                {profile.title}
              </p>
              <p className="mt-3 max-w-[38ch] text-[1.0625rem] leading-[1.7]">
                {profile.headline}{" "}
                <span className="font-bold text-[var(--mg-verm-ink)]">
                  {profile.headlineAccent}
                </span>
                .
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#projects"
                  className="mg-display border-[2.5px] border-[var(--mg-pine)] bg-[var(--mg-pine)] px-5 py-2.5 text-sm text-[var(--mg-paper)] transition-transform hover:-translate-y-0.5"
                >
                  See the work
                </a>
                <a
                  href="#contact"
                  className="mg-display border-[2.5px] border-[var(--mg-pine)] px-5 py-2.5 text-sm text-[var(--mg-pine)] transition-transform hover:-translate-y-0.5"
                >
                  Get in touch
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats as a stacked spec column. */}
        <div className="mg-panel mg-panel-blue">
          <p className="mg-label border-b-[2.5px] border-[var(--mg-indigo)] px-4 py-2 text-[var(--mg-indigo)]">
            The numbers
          </p>
          <dl className="divide-y-[1.5px] divide-[var(--mg-indigo)]/40">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-3 px-4 py-3"
              >
                <dt className="mg-label text-[var(--mg-pine)]">{s.label}</dt>
                <dd className="mg-display text-[1.5rem] text-[var(--mg-indigo)]">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Arrows />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills, set as the reference's divided column row                  */
/* ------------------------------------------------------------------ */

export function Disciplines() {
  // The reference splits three job titles across ruled columns. These three are
  // the areas the bio itself names, so the device carries real content rather
  // than invented labels.
  const columns = [
    { top: "Backend &", bottom: "Distributed systems" },
    { top: "Applied", bottom: "AI engineering" },
    { top: "Cloud &", bottom: "Infrastructure" },
  ];
  return (
    <div className="mg-panel grid divide-y-[2.5px] divide-[var(--mg-pine)] sm:grid-cols-3 sm:divide-x-[2.5px] sm:divide-y-0">
      {columns.map((c) => (
        <div key={c.top} className="px-4 py-5 text-center sm:px-5">
          <p className="mg-display text-[clamp(1.1rem,2.2vw,1.5rem)] text-[var(--mg-pine)]">
            {c.top}
          </p>
          <p className="mg-display text-[clamp(1.1rem,2.2vw,1.5rem)] text-[var(--mg-verm)]">
            {c.bottom}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  About                                                              */
/* ------------------------------------------------------------------ */

export function About() {
  const [lede, ...rest] = profile.about;
  return (
    <>
      <Panel id="about" title="01 / About" corner="Profile" ink="pine">
        <div className="grid gap-6 lg:grid-cols-[1fr_16rem] lg:gap-8">
          <div>
            <p className="text-[1.125rem] leading-[1.75] font-medium">{lede}</p>
            {rest.map((p) => (
              <p key={p.slice(0, 24)} className="mt-4 text-[1.0625rem] leading-[1.7]">
                {p}
              </p>
            ))}
          </div>

          <div>
            {/* The reference's warning blocks flanking a heading, which is the
                one place a full-bleed red fill belongs on this page. */}
            <div className="bg-[var(--mg-verm-ink)] px-3 py-2 text-center">
              <p className="mg-label text-[var(--mg-paper)]">In three words</p>
            </div>
            <ul className="mt-3 space-y-2">
              {["Production first", "Typed and clean", "Backend depth"].map((w) => (
                <li
                  key={w}
                  className="mg-check mg-display border-[2px] border-[var(--mg-pine)] px-3 py-2 text-sm text-[var(--mg-pine)]"
                >
                  {w}
                </li>
              ))}
            </ul>
            <p className="mg-label mt-4 text-[var(--mg-indigo)]">
              {education.degree}
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              {education.school} &middot; {education.period} &middot; CGPA{" "}
              {education.cgpa}
            </p>
          </div>
        </div>
      </Panel>
      <Arrows ink="blue" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Experience, as numbered chapters                                   */
/* ------------------------------------------------------------------ */

export function Chapters() {
  return (
    <>
      <Panel
        id="experience"
        title="02 / Experience"
        corner={`${experience.length} chapters`}
        ink="blue"
        bodyClassName="!p-0"
      >
        <ol className="divide-y-[2.5px] divide-[var(--mg-indigo)]">
          {experience.map((job, i) => (
            <li
              key={`${job.company}-${job.period}`}
              className="grid gap-x-5 gap-y-3 px-4 py-5 sm:grid-cols-[4.5rem_1fr] sm:px-5"
            >
              <div>
                <Tone tone={0.42} ink="blue" className="grid h-14 w-14 place-items-center border-[2.5px] border-[var(--mg-indigo)]">
                  <span className="mg-display text-[1.6rem] text-[var(--mg-indigo)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Tone>
              </div>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="mg-display text-[clamp(1.1rem,2.4vw,1.5rem)]">
                    {job.company}
                  </h3>
                  <p className="mg-label text-[var(--mg-verm-ink)]">
                    {job.period}
                  </p>
                </div>
                <p className="mt-0.5 text-[0.95rem] font-medium text-[var(--color-muted)]">
                  {job.role} &middot; {job.location}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {job.bullets.map((b) => (
                    <li
                      key={b.slice(0, 28)}
                      className="grid max-w-[72ch] grid-cols-[1.1rem_1fr] text-[1rem] leading-[1.65]"
                    >
                      <span aria-hidden className="text-[var(--mg-verm)]">
                        &#9642;
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="mg-label mt-3 text-[var(--mg-indigo)]">
                  {job.stack.join(" ・ ")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
      <Arrows />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Projects, as a comic page of panels                                */
/* ------------------------------------------------------------------ */

const PANEL_INK = ["red", "blue", "pine"] as const;

export function Catalogue() {
  return (
    <>
      <Panel
        id="projects"
        title="03 / Selected work"
        corner={`${projects.length} panels`}
        ink="red"
        bodyClassName="!p-3 sm:!p-3"
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const ink = PANEL_INK[i % PANEL_INK.length];
            // Seven panels do not tile a three-column grid: the last one
            // orphans and leaves a hole. Widening the first and the last to two
            // columns each makes nine cells, which fills exactly.
            const wide = i === 0 || i === projects.length - 1;
            return (
              <li key={p.title} className={wide ? "sm:col-span-2" : undefined}>
                <Panel ink={ink} className="h-full" bodyClassName="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <p className="mg-label text-[var(--color-muted)]">
                      {p.category}
                    </p>
                    <span className="mg-display text-[1.5rem] leading-none text-[var(--mg-verm)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mg-display mt-2 text-[1.15rem] leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[0.95rem] leading-[1.6]">
                    {p.description}
                  </p>
                  <p className="mg-label mt-3 text-[var(--mg-indigo)]">
                    {p.stack.join(" ・ ")}
                  </p>
                  {p.code || p.live ? (
                    <div className="mt-3 flex gap-3 border-t-[1.5px] border-[var(--color-hairline)] pt-3">
                      {p.code ? (
                        <a
                          href={p.code}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mg-label text-[var(--mg-pine)] underline decoration-[var(--mg-verm)] decoration-2 underline-offset-4"
                        >
                          Code &#8599;
                        </a>
                      ) : null}
                      {p.live ? (
                        <a
                          href={p.live}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mg-label text-[var(--mg-pine)] underline decoration-[var(--mg-verm)] decoration-2 underline-offset-4"
                        >
                          Live &#8599;
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </Panel>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Arrows ink="blue" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills                                                             */
/* ------------------------------------------------------------------ */

export function Toolkit() {
  return (
    <>
      <Panel
        id="skills"
        title="04 / The toolkit"
        corner={`${skills.length} groups`}
        ink="pine"
      >
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {skills.map((group) => (
            <div key={group.group}>
              <p className="mg-label border-b-[2px] border-[var(--mg-verm)] pb-1 text-[var(--mg-verm-ink)]">
                {group.group}
              </p>
              <p className="mt-2 text-[1rem] leading-[1.7]">
                {group.items.join(" ・ ")}
              </p>
            </div>
          ))}
        </div>
      </Panel>
      <Arrows />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Coding activity                                                    */
/* ------------------------------------------------------------------ */

export function Practice() {
  const data = getLeetCodeData();
  const label = `LeetCode activity: ${data.activeDays} active days, ${data.solved} problems solved.`;

  // Ink density rather than hue, which is what a one-colour print actually
  // does, and it keeps the grid inside the theme's three plates.
  const heat = [
    "transparent",
    "color-mix(in srgb, var(--mg-verm) 25%, transparent)",
    "color-mix(in srgb, var(--mg-verm) 55%, transparent)",
    "var(--mg-verm)",
    "var(--mg-pine)",
  ];

  return (
    <>
      <Panel
        id="coding"
        title="05 / Practice"
        corner={leetcode.badge}
        ink="red"
      >
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { v: data.solved, l: "Solved" },
            { v: data.activeDays, l: "Active days" },
            { v: data.streak, l: "Day streak" },
            { v: data.submissionsPastYear, l: "Submissions" },
          ].map((f) => (
            <div key={f.l} className="border-[2px] border-[var(--mg-pine)] px-3 py-3">
              <dd className="mg-display text-[clamp(1.5rem,3.4vw,2.25rem)] text-[var(--mg-verm)]">
                {f.v}
              </dd>
              <dt className="mg-label mt-1 text-[var(--mg-pine)]">{f.l}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto pb-1">
          <div
            className="grid w-max gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${WEEKS}, 9px)`,
              gridAutoFlow: "column",
              gridTemplateRows: `repeat(${DAYS}, 9px)`,
            }}
            role="img"
            aria-label={label}
          >
            {data.cells.map((level, i) => (
              <span
                key={i}
                className="h-[9px] w-[9px]"
                style={{
                  background: heat[level],
                  boxShadow:
                    level === 0
                      ? "inset 0 0 0 1px color-mix(in srgb, var(--mg-pine) 22%, transparent)"
                      : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <a
          href={leetcode.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mg-label mt-4 inline-block text-[var(--mg-indigo)] underline decoration-2 underline-offset-4"
        >
          LeetCode profile &#8599;
        </a>
      </Panel>
      <Arrows ink="blue" />
    </>
  );
}
