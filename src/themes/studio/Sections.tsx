import Image from "next/image";
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
import { BentoCard, Keycap, Availability } from "./BentoCard";

export function Hero() {
  return (
    <BentoCard
      id="hero"
      hue="butter"
      label="Hello"
      sticker="◎"
      className="lg:col-span-8"
    >
      <div className="flex-1">
        <h1 className="text-[clamp(2.5rem,5.2vw,4rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          {profile.name}
        </h1>
        <p className="mt-2 text-xl font-bold text-[var(--st-ink-2)]">
          {profile.title}, {profile.location}
        </p>
        {/* subtext has existed in content.ts since the beginning and was never
            rendered anywhere. It is the best short introduction in the file. */}
        <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-[1.65]">
          {profile.subtext}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 pt-2">
        <a
          href="#projects"
          className="inline-flex rounded-full bg-[var(--st-ink)] px-6 py-3 text-sm font-bold text-[var(--st-paper)] transition-transform hover:-translate-y-0.5"
        >
          See the work
        </a>
        {/* The secondary action is the keycap treatment at button scale, which
            is where the chip motif pays off as a system rather than a detail. */}
        <a
          href="#contact"
          className="st-key !rounded-full !px-6 !py-3 !text-sm"
        >
          Get in touch
        </a>
      </div>
    </BentoCard>
  );
}

export function Portrait() {
  return (
    <BentoCard
      hue="pink"
      label="The engineer"
      sticker="✦"
      className="lg:col-span-4"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-[1.5px] border-[var(--card-edge)] bg-white">
        <Image
          src="/ascii-source.jpg"
          alt={`${profile.name}, ${profile.title}`}
          fill
          sizes="(max-width: 1024px) 100vw, 20rem"
          className="object-cover"
          style={{ objectPosition: "50% 22%" }}
        />
      </div>
    </BentoCard>
  );
}

export function About() {
  return (
    <BentoCard
      id="about"
      hue="mint"
      label="01 / About"
      sticker="✿"
      className="lg:col-span-7"
    >
      <div className="space-y-4">
        {profile.about.map((para) => (
          <p key={para.slice(0, 24)} className="text-[1.0625rem] leading-[1.7]">
            {para}
          </p>
        ))}
      </div>
      <p className="mt-6 border-t-[1.5px] border-[var(--card-edge)] pt-4 text-sm text-[var(--st-ink-2)]">
        {education.degree} &middot; {education.school} &middot;{" "}
        {education.period} &middot; CGPA {education.cgpa}
      </p>
    </BentoCard>
  );
}

export function Stats() {
  return (
    <BentoCard
      hue="sky"
      label="By the numbers"
      sticker="▤"
      className="lg:col-span-5"
    >
      <dl className="grid h-full grid-cols-2 content-between gap-x-5 gap-y-7">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-extrabold tabular-nums">
              {s.value}
            </dd>
            <dt className="st-label mt-2">{s.label}</dt>
          </div>
        ))}
      </dl>
    </BentoCard>
  );
}

export function Experience() {
  return (
    <BentoCard
      id="experience"
      hue="peach"
      label="02 / Experience"
      sticker="◈"
      className="lg:col-span-12"
    >
      <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {experience.map((job) => (
          <li
            key={`${job.company}-${job.period}`}
            className="rounded-2xl border-[1.5px] border-[var(--card-edge)] bg-white/70 p-5"
          >
            <p className="st-label">{job.period}</p>
            <h3 className="mt-1.5 text-lg leading-tight font-bold">
              {job.company}
            </h3>
            <p className="text-sm font-medium text-[var(--st-ink-2)]">
              {job.role}
            </p>
            <ul className="mt-3 space-y-1.5">
              {job.bullets.map((b) => (
                <li
                  key={b.slice(0, 28)}
                  className="grid grid-cols-[1rem_1fr] text-sm leading-[1.6]"
                >
                  <span aria-hidden className="text-[#3f7d5e]">
                    ✓
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.stack.map((t) => (
                <Keycap key={t}>{t}</Keycap>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </BentoCard>
  );
}

export function Projects() {
  return (
    <BentoCard
      id="projects"
      hue="lav"
      label="03 / Projects"
      sticker="⌘"
      className="lg:col-span-12"
    >
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <li
            key={p.title}
            className="flex flex-col rounded-2xl border-[1.5px] border-[var(--card-edge)] bg-white/70 p-5"
          >
            <p className="st-label">{p.category}</p>
            <h3 className="mt-1.5 text-lg leading-tight font-bold">
              {p.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-[1.6]">{p.description}</p>

            <ul className="mt-4 space-y-1">
              <Availability has={Boolean(p.code)}>Source public</Availability>
              <Availability has={Boolean(p.live)}>Live deployment</Availability>
            </ul>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.stack.map((t) => (
                <Keycap key={t}>{t}</Keycap>
              ))}
            </div>

            {p.code || p.live ? (
              <div className="mt-4 flex gap-4 text-sm font-bold">
                {p.code ? (
                  <a
                    href={p.code}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-[var(--card-edge)] decoration-2 underline-offset-4"
                  >
                    Code ↗
                  </a>
                ) : null}
                {p.live ? (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-[var(--card-edge)] decoration-2 underline-offset-4"
                  >
                    Live ↗
                  </a>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

export function Skills() {
  return (
    <BentoCard
      id="skills"
      hue="mint"
      label="04 / Skills"
      sticker="⌥"
      className="lg:col-span-7"
    >
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {skills.map((group) => (
          <div key={group.group}>
            <h3 className="st-label">{group.group}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <Keycap key={item}>{item}</Keycap>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

export function Coding() {
  const data = getLeetCodeData();
  const label = `LeetCode activity: ${data.activeDays} active days, ${data.solved} problems solved.`;

  // Light theme, so the heat ramp runs paper to ink rather than the default
  // theme's greens, which would be a foreign object on this page.
  const heat = [
    "#ffffff",
    "color-mix(in srgb, var(--st-mint-edge) 45%, #fff)",
    "var(--st-mint-edge)",
    "color-mix(in srgb, var(--st-mint-edge) 55%, var(--st-ink))",
    "var(--st-ink)",
  ];

  return (
    <BentoCard
      id="coding"
      hue="butter"
      label="05 / Practice"
      sticker="◷"
      className="lg:col-span-5"
    >
      <div className="flex h-full flex-col justify-between gap-6">
        <dl className="grid grid-cols-2 gap-x-5 gap-y-6">
          {[
            { v: data.solved, l: "Solved" },
            { v: data.activeDays, l: "Active days" },
            { v: data.streak, l: "Day streak" },
            { v: data.submissionsPastYear, l: "Submissions" },
          ].map((f) => (
            <div key={f.l}>
              <dd className="text-3xl leading-none font-extrabold tabular-nums">
                {f.v}
              </dd>
              <dt className="st-label mt-1.5">{f.l}</dt>
            </div>
          ))}
        </dl>

        <div className="overflow-x-auto pb-1">
          <div
            className="grid w-max gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${WEEKS}, 8px)`,
              gridAutoFlow: "column",
              gridTemplateRows: `repeat(${DAYS}, 8px)`,
            }}
            role="img"
            aria-label={label}
          >
            {data.cells.map((level, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-[2px]"
                style={{
                  background: heat[level],
                  boxShadow:
                    level === 0
                      ? "inset 0 0 0 1px var(--card-edge)"
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
          className="inline-block text-sm font-bold underline decoration-[var(--card-edge)] decoration-2 underline-offset-4"
        >
          {leetcode.badge} ↗
        </a>
      </div>
    </BentoCard>
  );
}
