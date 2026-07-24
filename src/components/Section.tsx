import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

/** Consistent section shell: anchor, mono eyebrow, heading, optional intro. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-[var(--container-page)] scroll-mt-24 px-6 py-20 sm:px-8 sm:py-28 ${className}`}
    >
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">
            {eyebrow}
          </span>
          <span className="h-px flex-1 bg-hairline" aria-hidden />
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {intro ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {intro}
          </p>
        ) : null}
      </Reveal>
      <div className="mt-12">{children}</div>
    </section>
  );
}
