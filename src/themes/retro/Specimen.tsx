import { skills } from "@/content";

/**
 * Skills as a type-specimen sheet.
 *
 * The count is set as a large brick numeral in the corner of each cell, which
 * is the "value printed inside the block" motif from the swatch plates showing
 * up again in a different section. That repetition across sections is what
 * makes the theme read as one system rather than a set of separate treatments.
 */
export function Specimen() {
  return (
    <section
      id="skills"
      className="border-t-2 border-[var(--rt-cream)] text-[var(--rt-cream)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      <div className="mx-auto max-w-[var(--container-page)] px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="rt-display text-[clamp(2.25rem,5vw,4rem)]">
          The <span className="text-[var(--rt-brick-txt)]">toolkit</span>
        </h2>

        <div className="mt-9 grid gap-px bg-[var(--rt-cream-2)]/40 sm:grid-cols-2">
          {skills.map((group) => (
            <div
              key={group.group}
              className="bg-[var(--rt-char)] p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="rt-display text-[clamp(1.5rem,2.6vw,2rem)]">
                  {group.group}
                </h3>
                <span
                  aria-hidden
                  className="rt-display text-[2.5rem] leading-none text-[var(--rt-brick-txt)] tabular-nums"
                >
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-3 text-[1.0625rem] leading-[1.7] text-[var(--rt-cream)]">
                {group.items.join(" \u00b7 ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
