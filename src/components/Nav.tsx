"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { nav, profile } from "@/content";
import { GitHubIcon, LinkedInIcon, MenuIcon, CloseIcon, DocIcon } from "./Icons";

const SECTION_IDS = ["hero", ...nav.map((n) => n.href.slice(1))];

export function Nav() {
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  // Track which section is in view for the active indicator.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Subtle backdrop once scrolled past the hero fold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-hairline bg-base/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[var(--container-page)] items-center justify-between px-6 sm:px-8"
      >
        {/* Monogram / name */}
        <a
          href="#hero"
          className="group flex items-center gap-2.5"
          aria-label={`${profile.name}, back to top`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-surface font-mono text-sm font-semibold text-ink transition-colors group-hover:border-indigo">
            AP
          </span>
          <span className="hidden font-medium text-ink sm:inline">
            {profile.name}
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const isActive = active === item.href.slice(1);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`relative rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? "text-ink" : "text-muted hover:text-body"
                  }`}
                >
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId={reduce ? undefined : "nav-active"}
                      className="absolute inset-x-3 -bottom-px h-px bg-indigo"
                    />
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          <a
            href={profile.resume}
            download
            className="hidden items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-sm text-body transition-colors hover:border-indigo hover:text-ink sm:inline-flex"
          >
            <DocIcon width={16} height={16} />
            Resume
          </a>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <GitHubIcon width={18} height={18} />
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
            className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <LinkedInIcon width={18} height={18} />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-md text-ink transition-colors hover:bg-surface md:hidden"
          >
            {open ? <MenuIconSwap open /> : <MenuIconSwap />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-b border-hairline bg-base/95 backdrop-blur-md md:hidden"
          >
            <ul className="mx-auto flex max-w-[var(--container-page)] flex-col px-6 py-4">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-3 py-3 text-base transition-colors ${
                      active === item.href.slice(1)
                        ? "bg-surface text-ink"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={profile.resume}
                  download
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-md px-3 py-3 text-base text-body hover:bg-surface hover:text-ink"
                >
                  <DocIcon width={18} height={18} />
                  Resume
                </a>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function MenuIconSwap({ open }: { open?: boolean }) {
  return open ? <CloseIcon width={20} height={20} /> : <MenuIcon width={20} height={20} />;
}
