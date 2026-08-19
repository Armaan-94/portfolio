import { experience } from "@/content";
import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { Chip } from "./Chip";
import { SpotlightCard } from "./SpotlightCard";

export function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="02 / Experience"
      title="Five internships, real production impact."
      intro="Reverse chronological. Company first, because that is what gets scanned."
    >
      <ol className="relative">
        {/* vertical rail */}
        <span
          className="absolute left-[7px] top-2 bottom-2 w-px bg-hairline sm:left-[9px]"
          aria-hidden
        />
        {experience.map((job, i) => (
          <li key={`${job.company}-${i}`} className="relative pl-8 pb-12 last:pb-0 sm:pl-10">
            {/* node */}
            <span
              className="absolute left-0 top-1.5 grid h-4 w-4 place-items-center rounded-full border border-hairline bg-base sm:h-[18px] sm:w-[18px]"
              aria-hidden
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo shadow-[0_0_8px_1px_var(--color-indigo)]" />
            </span>

            <Reveal delay={i * 0.04}>
              <SpotlightCard className="relative overflow-hidden rounded-xl border border-hairline bg-gradient-to-b from-surface to-surface-2 p-5 transition-colors hover:border-indigo/40 sm:p-6">
                <div className="relative flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-lg font-semibold text-ink sm:text-xl">
                    {job.company}
                  </h3>
                  <span className="font-mono text-xs text-muted">
                    {job.period}
                  </span>
                </div>
                <p className="relative mt-0.5 text-sm text-body">
                  {job.role}
                  <span className="text-faint"> · {job.location}</span>
                </p>

                <ul className="relative mt-4 space-y-2">
                  {job.bullets.map((b, bi) => (
                    <li key={bi} className="flex gap-2.5 text-sm leading-relaxed text-body">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan"
                        aria-hidden
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-4 flex flex-wrap gap-1.5">
                  {job.stack.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              </SpotlightCard>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
