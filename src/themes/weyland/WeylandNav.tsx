"use client";

import { useState } from "react";
import { nav, profile } from "@/content";
import { useScrollSpy } from "@/lib/useScrollSpy";

const IDS = ["hero", ...nav.map((n) => n.href.slice(1))];

/** Line-art glyph per station, drawn rather than lettered. */
const GLYPHS: Record<string, React.ReactNode> = {
  about: <circle cx="7" cy="7" r="5" />,
  experience: (
    <>
      <ellipse cx="7" cy="7" rx="6" ry="2.5" />
      <ellipse cx="7" cy="7" rx="2.5" ry="6" />
    </>
  ),
  projects: (
    <>
      <circle cx="4" cy="7" r="2" />
      <circle cx="10" cy="4" r="1.6" />
      <circle cx="10.5" cy="10" r="2.4" />
    </>
  ),
  skills: (
    <>
      <rect x="1.5" y="1.5" width="11" height="11" />
      <line x1="1.5" y1="5.5" x2="12.5" y2="5.5" />
      <line x1="1.5" y1="9" x2="12.5" y2="9" />
    </>
  ),
  contact: (
    <>
      <rect x="1.5" y="3" width="11" height="8" />
      <polyline points="1.5,3 7,8 12.5,3" />
    </>
  ),
};

/**
 * The icon strip: hairline-separated cells, one per station, exactly like the
 * row of glyph buttons along the top of the reference. The active cell inverts,
 * and it is the only inverted element anywhere in this theme, which is what
 * makes it unmistakable without any colour.
 */
export function WeylandNav() {
  const active = useScrollSpy(IDS);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--wy-line)] bg-[var(--wy-ground)]">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[3.25rem] max-w-[var(--container-page)] items-stretch"
      >
        <a
          href="#hero"
          aria-label={`${profile.name}, back to top`}
          className="flex items-center border-r border-[var(--wy-line)] px-4 text-sm tracking-[0.2em]"
        >
          AP
        </a>

        <ul className="hidden items-stretch md:flex">
          {nav.map((item, i) => {
            const key = item.href.slice(1);
            const isActive = active === key;
            return (
              <li key={item.href} className="flex">
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex items-center gap-2.5 border-r border-[var(--wy-line)] px-4 transition-colors ${
                    isActive
                      ? "bg-[var(--wy-ink)] text-[var(--wy-ground)]"
                      : "text-[var(--wy-ink-dim)] hover:text-[var(--wy-ink)]"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    aria-hidden
                  >
                    {GLYPHS[key]}
                  </svg>
                  <span className="text-[0.6875rem] tracking-[0.16em] uppercase">
                    {String(i + 1).padStart(2, "0")} {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-stretch">
          <p className="hidden items-center gap-2 border-l border-[var(--wy-line)] px-4 lg:flex">
            <span
              aria-hidden
              className="wy-blip inline-block h-[5px] w-[5px] bg-[var(--wy-alert)]"
            />
            <span className="text-[0.625rem] tracking-[0.18em] uppercase">
              Ship syslink: active
            </span>
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="border-l border-[var(--wy-line)] px-4 text-sm md:hidden"
          >
            {open ? "×" : "≡"}
          </button>
        </div>
      </nav>

      {open ? (
        <ul className="border-t border-[var(--wy-line)] md:hidden">
          {nav.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-[var(--wy-line)] px-4 py-3 text-[0.6875rem] tracking-[0.16em] uppercase last:border-b-0"
              >
                {String(i + 1).padStart(2, "0")} {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
