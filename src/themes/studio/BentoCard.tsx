import type { ReactNode } from "react";

export type Hue = "mint" | "pink" | "lav" | "peach" | "sky" | "butter" | "plain";

type BentoCardProps = {
  hue: Hue;
  /** Corner label, e.g. "01 / About". Every card has one. */
  label: string;
  /** A single line-glyph, top right. One per card, never more. */
  sticker?: string;
  /** Present only on the seven contract sections. */
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * The one card in this theme.
 *
 * Fill, border and the printed edge all come from the hue class, so nothing
 * here names a colour and there is exactly one card recipe rather than six
 * that drift apart. The corner label is on every card deliberately: it is the
 * repetition element that makes a bento of differently sized boxes read as one
 * system.
 */
export function BentoCard({
  hue,
  label,
  sticker,
  id,
  className = "",
  children,
}: BentoCardProps) {
  const inner = (
    <>
      <header className="flex items-start justify-between gap-4">
        <p className="st-label pt-1">{label}</p>
        {sticker ? (
          <span aria-hidden className="st-sticker shrink-0">
            {sticker}
          </span>
        ) : null}
      </header>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </>
  );

  const classes = `st-card st-${hue} flex flex-col p-6 sm:p-7 ${className}`;

  return id ? (
    <section
      id={id}
      className={classes}
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      {inner}
    </section>
  ) : (
    <div className={classes}>{inner}</div>
  );
}

/** A tech-stack item, set as a keyboard key. */
export function Keycap({ children }: { children: ReactNode }) {
  return <span className="st-key">{children}</span>;
}

/**
 * The reference's good/bad tick pair, mapped onto something the data actually
 * knows rather than onto invented "best practice" copy, which on a portfolio
 * reads as content marketing. Whether a project's source and deployment are
 * public is a real, checkable fact about each one.
 *
 * The cross is neutral grey, never red: a project without a public repo is not
 * an error.
 */
export function Availability({
  has,
  children,
}: {
  has: boolean;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className="grid h-4 w-4 shrink-0 place-items-center text-[0.7rem] font-bold"
        style={{ color: has ? "#3f7d5e" : "#9aa0b4" }}
      >
        {has ? "✓" : "✗"}
      </span>
      <span className="sr-only">{has ? "Available:" : "Not available:"}</span>
      <span style={{ color: has ? "var(--st-ink)" : "#7a8093" }}>
        {children}
      </span>
    </li>
  );
}
