"use client";

import { useState } from "react";
import { nav, profile } from "@/content";
import { useScrollSpy } from "@/lib/useScrollSpy";

const IDS = ["hero", ...nav.map((n) => n.href.slice(1))];

/**
 * Nav as a row of pills, which is the same rounded, bordered, printed-edge
 * language as the cards. The active pill fills with ink, so the one dark
 * object on the page is always the thing you are looking at.
 */
export function StudioNav() {
  const active = useScrollSpy(IDS);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--st-paper)]/90 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[4.5rem] max-w-[var(--container-page)] items-center justify-between gap-4 px-5 sm:px-8"
      >
        <a
          href="#hero"
          aria-label={`${profile.name}, back to top`}
          className="st-card st-mint grid h-11 w-11 shrink-0 place-items-center !rounded-2xl text-sm font-extrabold"
        >
          AP
        </a>

        <ul className="hidden items-center gap-1.5 md:flex">
          {nav.map((item) => {
            const isActive = active === item.href.slice(1);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--st-ink)] text-[var(--st-paper)]"
                      : "text-[var(--st-ink-2)] hover:bg-white"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={profile.resume}
            download
            className="st-key hidden !rounded-full !px-4 sm:inline-flex"
          >
            Resume
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="st-key grid h-11 w-11 !rounded-2xl !p-0 text-base md:hidden"
          >
            {open ? "×" : "≡"}
          </button>
        </div>
      </nav>

      {open ? (
        <ul className="mx-auto max-w-[var(--container-page)] px-5 pb-4 md:hidden">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3.5 py-3 text-base font-medium text-[var(--st-ink)] hover:bg-white"
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
