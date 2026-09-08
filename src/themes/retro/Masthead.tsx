import { profile } from "@/content";

/**
 * The poster masthead.
 *
 * The two name lines flush to the same optical width by tracking each line
 * individually. That flush-both-edges block is the whole American-poster
 * gesture, and text-align: justify cannot produce it: justify spaces words,
 * and these are single words. The tracking values are hand-set for "ARMAAN"
 * (6 characters) against "PUNIA" (5), so they are not interchangeable.
 */
export function Masthead() {
  return (
    <section id="hero" className="rt-halftone text-[var(--rt-cream)]">
      <div className="mx-auto max-w-[var(--container-page)] px-5 pt-10 pb-14 sm:px-8 sm:pt-16 sm:pb-20">
        <div className="rt-caption flex items-baseline justify-between border-b border-[var(--rt-cream-2)] pb-3 text-[var(--rt-cream-2)]">
          <span>{profile.location}</span>
          <span className="hidden sm:inline">Est. 2026</span>
          <span>No. 01</span>
        </div>

        <h1 className="rt-display rt-misprint mt-6 flex flex-col">
          <span
            className="text-[clamp(3.5rem,13vw,10.5rem)]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Armaan
          </span>
          <span
            className="text-[clamp(3.5rem,13vw,10.5rem)] text-[var(--rt-brick-txt)]"
            style={{ letterSpacing: "0.055em" }}
          >
            Punia
          </span>
        </h1>

        <p className="rt-caption mt-5 border-t border-[var(--rt-cream-2)] pt-4 text-[var(--rt-sage-txt)]">
          Software Engineer &middot; Backend &middot; Applied AI &middot; Cloud
        </p>

        <p className="mt-8 max-w-[60ch] text-[clamp(1.15rem,2vw,1.5rem)] leading-[1.5]">
          {profile.headline}{" "}
          <span className="text-[var(--rt-brick-txt)]">
            {profile.headlineAccent}
          </span>
          .
        </p>

        {/* Rules, not buttons. A magnetic gloss button is a genre error in a
            screen print, so the affordance is an underline that draws in. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
          <a
            href="#projects"
            className="rt-rule-link rt-display pb-1 text-[1.75rem] text-[var(--rt-cream)]"
          >
            View the work &darr;
          </a>
          <a
            href="#contact"
            className="rt-rule-link rt-display pb-1 text-[1.75rem] text-[var(--rt-cream)]"
          >
            Get in touch &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
