import Image from "next/image";
import { profile, education, stats } from "@/content";

/**
 * The About spread: a duotone photo plate, a drop-capped lede, and a stats band.
 *
 * The duotone is pure CSS over the existing JPEG rather than a second asset:
 * a brick ground, the image desaturated and multiplied over it, then a cream
 * screen pass to lift the highlights back. Two blend modes, no new bytes.
 */
export function AboutPlate() {
  const [lede, ...rest] = profile.about;

  return (
    <section
      id="about"
      className="border-t-2 border-[var(--rt-cream)] text-[var(--rt-cream)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      <div className="mx-auto max-w-[var(--container-page)] px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <figure className="lg:col-span-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] border-[12px] border-[var(--rt-cream)] bg-[var(--rt-brick)]">
              <Image
                src="/armaan.jpg"
                alt={`${profile.name}, ${profile.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 22rem"
                className="object-cover mix-blend-multiply grayscale contrast-125"
                style={{ objectPosition: "64% 20%", opacity: 0.92 }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[var(--rt-cream)] opacity-[0.18] mix-blend-screen"
              />
            </div>
            <figcaption className="rt-caption mt-3 text-[var(--rt-cream-2)]">
              Fig. 1 &mdash; A. Punia, {profile.location}, 2026
            </figcaption>
          </figure>

          <div className="lg:col-span-8">
            <h2 className="rt-display text-[clamp(2.25rem,5vw,4rem)]">
              About the
              <br />
              <span className="text-[var(--rt-brick-txt)]">engineer</span>
            </h2>

            <p className="rt-lede mt-7 max-w-[62ch] text-[clamp(1.15rem,1.7vw,1.4rem)] leading-[1.5]">
              {lede}
            </p>

            {rest.map((para) => (
              <p
                key={para.slice(0, 24)}
                className="mt-5 max-w-[64ch] text-[1.0625rem] leading-[1.7] text-[var(--rt-cream)]"
              >
                {para}
              </p>
            ))}

            <p className="rt-caption mt-7 border-t border-[var(--rt-cream-2)] pt-4 text-[var(--rt-cream-2)]">
              {education.degree} &middot; {education.school} &middot;{" "}
              {education.period} &middot; CGPA {education.cgpa}
            </p>
          </div>
        </div>

        {/* Stats band: four Anton numerals on a rule, captions beneath. */}
        <dl className="mt-14 grid grid-cols-2 gap-y-9 border-y-2 border-[var(--rt-cream)] py-9 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="rt-caption text-[var(--rt-cream-2)]">{s.label}</dt>
              <dd className="rt-display mt-1.5 text-[clamp(2.25rem,4.5vw,3.5rem)] text-[var(--rt-cream)] tabular-nums">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
