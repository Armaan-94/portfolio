"use client";

import type { CSSProperties } from "react";
import { profile } from "@/content";
import { useContactForm } from "@/lib/useContactForm";
import { Panel, Stamp } from "./Panels";

export function MangaContact() {
  const {
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    company,
    setCompany,
    status,
    errorMsg,
    errorRef,
    onSubmit,
    onMessageKeyDown,
    reset,
  } = useContactForm();

  // text-base under sm is not styling: an input below 16px makes iOS Safari
  // zoom the page on focus.
  const field =
    "mt-1.5 w-full border-[2px] border-[var(--mg-pine)] bg-[var(--mg-paper)] px-3 py-2 text-base text-[var(--mg-pine)] placeholder:text-[var(--color-faint)] focus:border-[var(--mg-verm)] focus:outline-none sm:text-sm";

  return (
    <Panel
      id="contact"
      title="06 / Get in touch"
      corner="Transmission"
      ink="blue"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-8">
        <div>
          {/* The big shout panel: focus lines converging on the line that
              matters, which is what the reference does with its cover copy. */}
          <div
            className="mg-burst border-[2.5px] border-[var(--mg-verm)] px-5 py-7 text-center text-[var(--mg-verm)]"
            style={{ "--mg-burst-opacity": 0.3 } as CSSProperties}
          >
            <p className="mg-display text-[clamp(1.75rem,4.6vw,2.75rem)] text-[var(--mg-verm)]">
              Let us build
              <br />
              something
              <br />
              that runs.
            </p>
          </div>

          <p className="mt-5 max-w-[40ch] text-[1.0625rem] leading-[1.7] text-[var(--mg-pine)]">
            Open to software engineering roles from 2026. The fastest way to
            reach me is email. I read everything.
          </p>

          <a
            href={`mailto:${profile.email}`}
            className="mg-display mt-4 inline-block border-b-[3px] border-[var(--mg-verm)] pb-0.5 text-[1.05rem] text-[var(--mg-pine)]"
          >
            {profile.email}
          </a>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {(
              [
                ["LinkedIn", profile.links.linkedin],
                ["GitHub", profile.links.github],
                ["LeetCode", profile.links.leetcode],
              ] as const
            ).map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="mg-label border-[2px] border-[var(--mg-pine)] px-3 py-1.5 text-[var(--mg-pine)] transition-colors hover:bg-[var(--mg-pine)] hover:text-[var(--mg-paper)]"
              >
                {label} &#8599;
              </a>
            ))}
            <Stamp lines={["Reply", "within", "a day"]} ink="red" size={64} />
          </div>
        </div>

        <div className="border-[2.5px] border-[var(--mg-pine)] p-4 sm:p-5">
          {status === "success" ? (
            <div>
              <p className="mg-display text-[1.75rem] text-[var(--mg-verm)]">
                Sent!
              </p>
              <p className="mt-2 text-[1.0625rem] leading-[1.7]">
                Thanks for reaching out. It landed in my inbox and I will get
                back to you soon.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mg-label mt-4 border-[2px] border-[var(--mg-pine)] px-3 py-2 text-[var(--mg-pine)]"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="relative">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="mg-name" className="mg-label text-[var(--mg-pine)]">
                    Name
                  </label>
                  <input
                    id="mg-name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="mg-email" className="mg-label text-[var(--mg-pine)]">
                    Email
                  </label>
                  <input
                    id="mg-email"
                    type="email"
                    inputMode="email"
                    required
                    spellCheck={false}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={field}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="mg-message" className="mg-label text-[var(--mg-pine)]">
                  Message
                </label>
                <textarea
                  id="mg-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={onMessageKeyDown}
                  placeholder="Tell me what you are building"
                  className={`${field} resize-y`}
                />
              </div>

              {/* Honeypot: hidden from humans, catches bots. Never fill it. */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
              >
                <label>
                  Company
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="mg-display mt-5 w-full border-[2.5px] border-[var(--mg-pine)] bg-[var(--mg-pine)] py-3 text-[var(--mg-paper)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {status === "sending" ? "Sending" : "Send it"}
              </button>

              {status === "error" ? (
                <p
                  ref={errorRef}
                  tabIndex={-1}
                  aria-live="polite"
                  className="mt-3 text-sm text-[var(--mg-verm-ink)] focus:outline-none"
                >
                  {errorMsg}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function MangaFooter() {
  return (
    <footer className="mt-3 border-t-[2.5px] border-[var(--mg-pine)] pt-4 pb-10">
      <div className="mx-auto flex max-w-[var(--container-page)] flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
        <p className="mg-display text-[1.1rem] text-[var(--mg-pine)]">
          {profile.name}
        </p>
        <p className="mg-label text-[var(--color-muted)]">
          &copy; {new Date().getFullYear()} &middot; Open to software
          engineering roles
        </p>
        <a
          href="#hero"
          className="mg-label border-b-[2px] border-[var(--mg-verm)] pb-0.5 text-[var(--mg-pine)]"
        >
          Back to top &uarr;
        </a>
      </div>
    </footer>
  );
}
