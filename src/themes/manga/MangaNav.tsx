"use client";

import { useState } from "react";
import { nav, profile } from "@/content";
import { useScrollSpy } from "@/lib/useScrollSpy";

const IDS = ["hero", ...nav.map((n) => n.href.slice(1))];

/**
 * A running head, ruled off from the page the way a printed masthead is.
 * The active item inverts to a solid ink block, which is the only fully
 * reversed element in the bar, so it is unmistakable without relying on hue.
 */
export function MangaNav() {
  const active = useScrollSpy(IDS);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-[2.5px] border-[var(--mg-pine)] bg-[var(--mg-paper)]">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[4.25rem] max-w-[var(--container-page)] items-center justify-between gap-4 px-4 sm:px-6"
      >
        <a
          href="#hero"
          aria-label={`${profile.name}, back to top`}
          className="mg-display flex items-baseline gap-2 text-[1.35rem] text-[var(--mg-pine)]"
        >
          <span className="text-[var(--mg-verm)]">A</span>
          <span>Punia</span>
        </a>

        <ul className="hidden items-center md:flex">
          {nav.map((item, i) => {
            const isActive = active === item.href.slice(1);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`mg-label inline-block px-3.5 py-2 transition-colors ${
                    isActive
                      ? "bg-[var(--mg-pine)] text-[var(--mg-paper)]"
                      : "text-[var(--mg-pine)] hover:text-[var(--mg-verm-ink)]"
                  }`}
                >
                  <span className="opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
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
            className="mg-label hidden border-[2px] border-[var(--mg-verm)] px-3 py-1.5 text-[var(--mg-verm-ink)] sm:inline-block"
          >
            Resume
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="mg-display grid h-10 w-10 place-items-center border-[2px] border-[var(--mg-pine)] text-lg md:hidden"
          >
            {open ? "×" : "≡"}
          </button>
        </div>
      </nav>

      {open ? (
        <ul className="border-t-[2.5px] border-[var(--mg-pine)] md:hidden">
          {nav.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="mg-label block border-b-[1.5px] border-[var(--color-hairline)] px-4 py-3 text-[var(--mg-pine)] last:border-b-0"
              >
                <span className="opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
