import type { CSSProperties, ReactNode } from "react";

type Ink = "pine" | "red" | "blue";

const PANEL: Record<Ink, string> = {
  pine: "mg-panel",
  red: "mg-panel mg-panel-red",
  blue: "mg-panel mg-panel-blue",
};

const INK: Record<Ink, string> = {
  pine: "var(--mg-pine)",
  red: "var(--mg-verm-ink)",
  blue: "var(--mg-indigo)",
};

/**
 * A comic panel: the double rule, plus an optional title bar across the top.
 *
 * Every section on this page is a panel, which is what makes the layout read as
 * a printed page rather than as a stack of web sections.
 */
export function Panel({
  id,
  title,
  corner,
  ink = "pine",
  className = "",
  bodyClassName = "",
  children,
}: {
  id?: string;
  title?: string;
  corner?: string;
  ink?: Ink;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const inner = (
    <>
      {title ? (
        <div
          className="flex items-center justify-between gap-4 border-b-[2.5px] px-4 py-2 sm:px-5"
          style={{ borderColor: INK[ink] }}
        >
          <h2 className="mg-display text-[clamp(1.1rem,2.2vw,1.6rem)]" style={{ color: INK[ink] }}>
            {title}
          </h2>
          {corner ? (
            <p className="mg-label shrink-0" style={{ color: INK[ink] }}>
              {corner}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className={`px-4 py-5 sm:px-5 sm:py-6 ${bodyClassName}`}>{children}</div>
    </>
  );

  const classes = `${PANEL[ink]} ${className}`;
  return id ? (
    <section id={id} className={classes} style={{ scrollMarginTop: "var(--scroll-pad)" }}>
      {inner}
    </section>
  ) : (
    <div className={classes}>{inner}</div>
  );
}

/** The notched banner from the reference, used as a section marker. */
export function Ribbon({
  children,
  ink = "red",
  className = "",
}: {
  children: ReactNode;
  ink?: Ink;
  className?: string;
}) {
  return (
    <span
      className={`mg-ribbon mg-label inline-block px-5 py-1.5 text-[var(--mg-paper)] ${className}`}
      style={{ background: INK[ink] }}
    >
      {children}
    </span>
  );
}

/** The circular overprint stamp in the corner of the reference sheet. */
export function Stamp({
  lines,
  ink = "red",
  size = 78,
  className = "",
}: {
  lines: string[];
  ink?: Ink;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`mg-stamp shrink-0 ${className}`}
      style={{ color: INK[ink], width: size, height: size, fontSize: size / 8.5 }}
    >
      <span>
        {lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * The transition between sections in the reference: three arrows, nothing else.
 * Decorative, so it is hidden from assistive tech rather than read out as
 * "down arrow down arrow down arrow".
 */
export function Arrows({ ink = "red" }: { ink?: Ink }) {
  return (
    <p
      aria-hidden
      className="py-3 text-center text-xl leading-none tracking-[0.5em]"
      style={{ color: INK[ink] }}
    >
      &#8595;&#8595;&#8595;
    </p>
  );
}

/** Screentone wash. `tone` is the dot density, 0 to 1. */
export function Tone({
  tone = 0.3,
  ink = "red",
  className = "",
  children,
}: {
  tone?: number;
  ink?: Ink;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`mg-tone ${className}`}
      style={{ color: INK[ink], "--mg-tone-opacity": tone } as CSSProperties}
    >
      {children}
    </div>
  );
}
