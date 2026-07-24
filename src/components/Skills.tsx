import { skills } from "@/content";
import { Section } from "./Section";
import { Reveal } from "./Reveal";

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="04 / Skills"
      title="The toolkit."
      intro="Grouped by where it sits in the stack. Only what I actually work with."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group, i) => (
          <Reveal key={group.group} delay={(i % 3) * 0.05}>
            <div className="h-full rounded-xl border border-hairline bg-gradient-to-b from-surface to-surface-2 p-5">
              <h3 className="font-mono text-xs tracking-[0.15em] text-cyan uppercase">
                {group.group}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-hairline bg-base/50 px-2.5 py-1 text-sm text-body transition-colors hover:border-indigo/50 hover:text-ink"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
