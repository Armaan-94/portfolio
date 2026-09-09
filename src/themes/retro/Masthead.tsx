import { profile } from "@/content";

/**
 * The poster masthead.
 *
 * Both name lines flush to the same width, which is the whole gesture of a
 * printed masthead. text-align: justify cannot do it, because justify
 * distributes space between WORDS and these are single words; hand-tuned
 * letter-spacing cannot either, because the correct value depends on the
 * rendered width of two different strings at a clamped font size.
 *
 * So each line is a flex row of individual characters with space-between, and
 * the column stretches both lines to the width of the wider one. The browser
 * does the tracking, at any viewport, for any name.
 *
 * Splitting into per-character spans destroys the text for assistive tech and
 * for selection, so the real name is rendered once, visually hidden, and the
 * split version is aria-hidden.
 */
/** One line of the masthead, tracked out to fill the block. */
function FlushLine({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex justify-between text-[clamp(3.5rem,13vw,10.5rem)] ${className}`}
    >
      {[...text].map((ch, i) => (
        <span key={`${ch}-${i}`}>{ch}</span>
      ))}
    </span>
  );
}

export function Masthead() {
  return (
    <section id="hero" className="rt-halftone text-[var(--rt-cream)]">
      <div className="mx-auto max-w-[var(--container-page)] px-5 pt-9 pb-12 sm:px-8 sm:pt-12 sm:pb-16">
        <div className="rt-caption flex items-baseline justify-between border-b border-[var(--rt-cream-2)] pb-3 text-[var(--rt-cream-2)]">
          <span>{profile.location}</span>
          <span className="hidden sm:inline">Est. 2026</span>
          <span>No. 01</span>
        </div>

        {/* Masthead left, deck right. Six characters cannot fill a 1200px
            measure at a readable size without the tracking falling apart, so
            rather than stretching the name across the page the space beside it
            carries the deck, which is how a printed masthead is actually set. */}
        <div className="mt-6 grid items-end gap-x-12 gap-y-9 lg:grid-cols-[auto_1fr]">
          <h1 className="rt-display rt-misprint flex w-fit flex-col">
            <span className="sr-only">{profile.name}</span>
            <FlushLine text="Armaan" />
            <FlushLine text="Punia" className="text-[var(--rt-brick-txt)]" />
          </h1>

          <div className="lg:pb-3">
            <p className="max-w-[34ch] text-[clamp(1.15rem,1.7vw,1.45rem)] leading-[1.5]">
              {profile.headline}{" "}
              <span className="text-[var(--rt-brick-txt)]">
                {profile.headlineAccent}
              </span>
              .
            </p>

            {/* Rules, not buttons. A magnetic gloss button is a genre error in
                a screen print, so the affordance is an underline that draws in. */}
            <div className="mt-8 flex flex-wrap items-center gap-x-9 gap-y-4">
              <a
                href="#projects"
                className="rt-rule-link rt-display pb-1 text-[1.5rem] text-[var(--rt-cream)]"
              >
                View the work &darr;
              </a>
              <a
                href="#contact"
                className="rt-rule-link rt-display pb-1 text-[1.5rem] text-[var(--rt-cream)]"
              >
                Get in touch &rarr;
              </a>
            </div>
          </div>
        </div>

        <p className="rt-caption mt-10 border-t border-[var(--rt-cream-2)] pt-4 text-[var(--rt-sage-txt)]">
          Software Engineer &middot; Backend &middot; Applied AI &middot; Cloud
        </p>
      </div>
    </section>
  );
}
