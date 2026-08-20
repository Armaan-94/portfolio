import Image from "next/image";
import { profile, education, stats } from "@/content";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section
      id="about"
      className="mx-auto w-full max-w-[var(--container-page)] scroll-mt-24 px-6 py-20 sm:px-8 sm:py-28"
    >
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">
            01 / About
          </span>
          <span className="h-px flex-1 bg-hairline" aria-hidden />
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Portrait */}
        <Reveal className="lg:col-span-4">
          <div className="group relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-hairline bg-surface-2">
            <Image
              src="/armaan.jpg"
              alt={`${profile.name} receiving an award on stage`}
              fill
              sizes="(max-width: 1024px) 20rem, 20rem"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              style={{ objectPosition: "64% 20%" }}
            />
            {/* bottom scrim for depth + a faint inner ring to frame it */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/75 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06]" />
          </div>
        </Reveal>

        {/* Copy */}
        <div className="lg:col-span-8">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Backend depth, applied AI, and cloud that holds it together.
            </h2>
          </Reveal>
          <div className="mt-6 space-y-5">
            {profile.about.map((para, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className="text-base leading-relaxed text-body sm:text-lg">
                  {para}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Degree and school only. The CGPA lives in the stat card below and
              stating it twice, two lines apart, just reads as repetition. */}
          <Reveal delay={0.1}>
            <p className="mt-6 font-mono text-sm text-muted">
              {education.degree}, {education.school}. {education.period}.
            </p>
          </Reveal>

          {/* By the numbers */}
          <Reveal delay={0.15}>
            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-surface-2 px-4 py-5">
                  <dt className="font-mono text-[11px] tracking-wide text-muted uppercase">
                    {s.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-ink">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
