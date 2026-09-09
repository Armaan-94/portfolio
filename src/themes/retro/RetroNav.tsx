"use client";

import { useState } from "react";
import { nav, profile } from "@/content";
import { useScrollSpy } from "@/lib/useScrollSpy";

const IDS = ["hero", ...nav.map((n) => n.href.slice(1))];

/**
 * A masthead rule rather than a floating pill bar. Print puts its running head
 * hard against a rule at the top of the page, so the whole bar is a single
 * cream hairline with the items sitting on it.
 */
export function RetroNav() {
  const active = useScrollSpy(IDS);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--rt-cream)] bg-[var(--rt-char)]">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[var(--container-page)] items-center justify-between px-5 sm:px-8"
      >
        <a
          href="#hero"
          className="rt-display text-2xl text-[var(--rt-cream)]"
          aria-label={`${profile.name}, back to top`}
        >
          A<span className="text-[var(--rt-brick-txt)]">P</span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {nav.map((item, i) => {
            const isActive = active === item.href.slice(1);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`rt-caption transition-colors ${
                    isActive
                      ? "text-[var(--rt-brick-txt)]"
                      : "text-[var(--rt-cream-2)] hover:text-[var(--rt-cream)]"
                  }`}
                >
                  <span className="tabular-nums opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <a
            href={profile.resume}
            download
            className="rt-caption hidden text-[var(--rt-cream)] underline decoration-[var(--rt-brick)] decoration-2 underline-offset-4 sm:inline"
          >
            Resume
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="rt-display grid h-11 w-11 place-items-center text-xl text-[var(--rt-cream)] md:hidden"
          >
            {open ? "\u00d7" : "\u2261"}
          </button>
        </div>
      </nav>

      {open ? (
        <ul className="border-t border-[var(--rt-cream-2)] px-5 pb-4 md:hidden">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="rt-display block py-3 text-3xl text-[var(--rt-cream)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
