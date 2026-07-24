import { projects, type Project } from "@/content";
import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { Chip } from "./Chip";
import { SpotlightCard } from "./SpotlightCard";
import { CodeIcon, ExternalIcon } from "./Icons";

const categoryStyles: Record<Project["category"], string> = {
  Backend: "text-indigo border-indigo/30 bg-indigo/10",
  "AI/ML": "text-cyan border-cyan/30 bg-cyan/10",
  "Full-stack": "text-violet border-violet/30 bg-violet/10",
  Frontend: "text-indigo border-indigo/30 bg-indigo/10",
  Algorithms: "text-cyan border-cyan/30 bg-cyan/10",
  Web: "text-violet border-violet/30 bg-violet/10",
};

export function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="03 / Projects"
      title="Selected work."
      intro="A mix of backend systems, applied AI, and full-stack builds. Every link is live."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal as="article" key={p.title} delay={(i % 2) * 0.06}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <SpotlightCard className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-gradient-to-b from-surface to-surface-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo/50 hover:shadow-[0_12px_40px_-12px_rgba(99,102,241,0.35)]">
      <div className="relative flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] ${categoryStyles[p.category]}`}
        >
          {p.category}
        </span>
      </div>

      <h3 className="relative mt-4 text-xl font-semibold tracking-tight text-ink">
        {p.title}
      </h3>
      <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted">
        {p.description}
      </p>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        {p.code ? (
          <a
            href={p.code}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-indigo hover:text-ink"
          >
            <CodeIcon width={15} height={15} />
            Code
          </a>
        ) : null}
        {p.live ? (
          <a
            href={p.live}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-md border border-indigo/40 bg-indigo/10 px-3 py-1.5 text-xs font-medium text-indigo transition-colors hover:bg-indigo/20 hover:text-ink"
          >
            <ExternalIcon width={15} height={15} />
            Live
          </a>
        ) : null}
      </div>
    </SpotlightCard>
  );
}
